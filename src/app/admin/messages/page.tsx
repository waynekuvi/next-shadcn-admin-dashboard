"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Paperclip, Send, MoreVertical, Loader2, Edit, Trash2, Info, X, File, Image as ImageIcon, BadgeCheck } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import useSWR, { mutate } from "swr";
import { formatDistanceToNow } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  name: string;
  organizationName?: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  type: string;
  unreadCount?: number;
}

interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

interface Message {
  id: string;
  sender: "me" | "them";
  senderName?: string;
  senderImage?: string | null;
  senderRole?: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

interface Organization {
  id: string;
  name: string;
  logo?: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return "";
  }
  return formatDistanceToNow(date, { addSuffix: true })
    .replace("about ", "")
    .replace(" hours", "h")
    .replace(" hour", "h")
    .replace(" minutes", "m")
    .replace(" minute", "m");
};

export default function AdminMessagesPage() {
  const { user: currentUser, loading: sessionLoading } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [selectedOrgForChannel, setSelectedOrgForChannel] = useState<string>("");
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [editChannelName, setEditChannelName] = useState("");
  const [deletingChannel, setDeletingChannel] = useState<Channel | null>(null);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const channelsKey = currentUser ? "/api/channels" : null;
  const { data: channels, isLoading: channelsLoading, error: channelsError } = useSWR<Channel[]>(channelsKey, fetcher, {
    refreshInterval: 10000,
    onSuccess: (data) => {
      if (!activeChannelId && Array.isArray(data) && data.length > 0) {
        setActiveChannelId(data[0].id);
      }
    },
    onError: (err) => {
      console.error("Error loading channels:", err);
    },
  });

  const { data: organizations } = useSWR<Organization[]>(
    () => (isAdmin ? "/api/organization" : null),
    fetcher
  );

  const { data: messages, isLoading: messagesLoading, mutate: mutateMessages } = useSWR<Message[]>(
    activeChannelId ? `/api/messages?channelId=${activeChannelId}` : null,
    fetcher,
    { 
      refreshInterval: 5000,
      onSuccess: () => {
        // Refresh channel list to update unread counts when messages are loaded
        mutate("/api/channels");
      }
    }
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const channelList = Array.isArray(channels) ? channels : [];
  const organizationList = Array.isArray(organizations) ? organizations : [];

  useEffect(() => {
    if (isAdmin && organizationList.length > 0 && !selectedOrgForChannel) {
      setSelectedOrgForChannel(organizationList[0].id);
    }
  }, [isAdmin, organizationList, selectedOrgForChannel]);

  const activeChannel = channelList.find((c) => c.id === activeChannelId);

  const handleCreateChannel = async (orgIdParam?: string) => {
    try {
      setCreatingChannel(true);
      const payload: Record<string, string> = {};
      if (orgIdParam) {
        payload.organizationId = orgIdParam;
      }
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const channel = await res.json();
        setActiveChannelId(channel.id);
        mutate("/api/channels");
      }
    } catch (error) {
      console.error("Failed to create channel", error);
    } finally {
      setCreatingChannel(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    const newAttachments: Attachment[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newAttachments.push(data);
        } else {
          const error = await res.json();
          alert(`Failed to upload ${file.name}: ${error.error || "Unknown error"}`);
        }
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (error) {
      console.error("Failed to upload files", error);
      alert("Failed to upload files");
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && attachments.length === 0) || !activeChannelId) return;

    const messageContent = messageInput.trim() || (attachments.length > 0 ? "📎 Attachment" : "");
    const messageWithAttachments = attachments.length > 0 
      ? JSON.stringify({ content: messageContent, attachments })
      : messageContent;

    const optimisticMessage: Message = {
      id: Date.now().toString(),
      sender: "me",
      content: messageContent,
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    mutateMessages([...(messages || []), optimisticMessage], false);
    setMessageInput("");
    setAttachments([]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          channelId: activeChannelId, 
          content: messageWithAttachments 
        }),
      });
      if (res.ok) {
        mutateMessages();
        mutate("/api/channels");
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleEditChannel = async () => {
    if (!editingChannel || !editChannelName.trim()) return;

    try {
      const res = await fetch(`/api/channels/${editingChannel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editChannelName.trim() }),
      });
      if (res.ok) {
        mutate("/api/channels");
        setEditingChannel(null);
        setEditChannelName("");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update channel");
      }
    } catch (error) {
      console.error("Failed to update channel", error);
      alert("Failed to update channel");
    }
  };

  const handleDeleteChannel = async () => {
    if (!deletingChannel) return;

    try {
      const res = await fetch(`/api/channels/${deletingChannel.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate("/api/channels");
        if (activeChannelId === deletingChannel.id) {
          setActiveChannelId(null);
        }
        setDeletingChannel(null);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete channel");
      }
    } catch (error) {
      console.error("Failed to delete channel", error);
      alert("Failed to delete channel");
    }
  };

  const openEditDialog = (channel: Channel) => {
    setEditingChannel(channel);
    setEditChannelName(channel.name);
  };

  if (sessionLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Redirect non-admin users
  if (!isAdmin) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Access Denied</p>
          <p className="text-sm text-muted-foreground">You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-background md:flex-row min-h-0">
      {/* Channels Sidebar */}
      <div className="flex w-full flex-col border-r md:w-80">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Client Messages</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations" className="pl-8" />
          </div>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {channelsLoading && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
              </div>
            )}

            {channelsError && (
              <div className="p-4 text-center">
                <p className="text-sm text-destructive mb-2">Failed to load channels</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => mutate("/api/channels")}
                >
                  Retry
                </Button>
              </div>
            )}

            {channelList.map((channel) => (
              <div
                key={channel.id}
                className={cn(
                  "group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent",
                  activeChannelId === channel.id && "bg-accent"
                )}
              >
                <button
                  onClick={() => setActiveChannelId(channel.id)}
                  className="flex flex-1 items-start gap-3 text-left"
                >
                  <Avatar>
                    <AvatarImage src={channel.avatar} />
                    <AvatarFallback>{(channel.name || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{channel.organizationName || channel.name}</span>
                          {(channel.name === "Atliso Support Team" || channel.organizationName === "Atliso Support Team") && (
                            <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
                          )}
                          {(channel.unreadCount ?? 0) > 0 && (
                            <span className="h-2 w-2 rounded-full bg-black dark:bg-white shrink-0" />
                          )}
                        </div>
                        <span className="truncate text-[11px] text-muted-foreground">{channel.name}</span>
                      </div>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{formatRelativeTime(channel.lastMessageTime)}</p>
                  </div>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(channel)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Channel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowChannelInfo(true)}>
                      <Info className="mr-2 h-4 w-4" />
                      Channel Info
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeletingChannel(channel)}
                      variant="destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Channel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {!channelsLoading && channelList.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-4">No client conversations yet.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        {isAdmin && (
          <>
            <Separator />
            <div className="space-y-3 p-4">
              <Label className="text-xs uppercase text-muted-foreground">Start client thread</Label>
              <Select value={selectedOrgForChannel} onValueChange={setSelectedOrgForChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizationList.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => handleCreateChannel(selectedOrgForChannel)}
                disabled={!selectedOrgForChannel || creatingChannel}
                className="w-full"
              >
                {creatingChannel ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Start Conversation
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-3">
            {activeChannel ? (
              <>
                <Avatar>
                  <AvatarImage src={activeChannel.avatar} />
                  <AvatarFallback>{(activeChannel.name || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{activeChannel.organizationName || activeChannel.name}</h3>
                    {(activeChannel.name === "Atliso Support Team" || activeChannel.organizationName === "Atliso Support Team") && (
                      <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activeChannel.type?.toLowerCase() === "support" ? "Support Ticket" : "Direct Message"}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Select a conversation</div>
            )}
          </div>
          <div className="flex gap-2">
            {activeChannel && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(activeChannel)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Channel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowChannelInfo(true)}>
                    <Info className="mr-2 h-4 w-4" />
                    Channel Info
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeletingChannel(activeChannel)}
                    variant="destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Channel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div ref={scrollRef} className="absolute inset-0 overflow-y-auto bg-muted/10 p-6">
            <div className="flex min-h-full flex-col justify-end gap-6">
              {messagesLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !messages?.length ? (
                <div className="py-10 text-center text-muted-foreground">No messages yet. Say hello! 👋</div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex max-w-[80%] gap-3",
                      message.sender === "me" ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    {message.sender === "them" && (
                      <Avatar className="mt-1 h-8 w-8">
                        <AvatarImage src={message.senderImage || undefined} />
                        <AvatarFallback>{message.senderName?.substring(0, 1) || "?"}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn("flex flex-col gap-1", message.sender === "me" && "items-end")}>
                      {message.sender === "them" && message.senderName && (
                        <span className="ml-1 text-xs text-muted-foreground flex items-center gap-1">
                          {message.senderName}
                          {message.senderRole === "ADMIN" && (
                            <BadgeCheck className="h-3 w-3 text-blue-500 shrink-0" />
                          )}
                          <span className="ml-2 opacity-50">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </span>
                      )}
                      <div
                        className={cn(
                          "whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm",
                          message.sender === "me"
                            ? "bg-primary text-primary-foreground"
                            : "border bg-background shadow-sm"
                        )}
                      >
                        {message.content && message.content !== "📎 Attachment" && (
                          <div className="mb-2">{message.content}</div>
                        )}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="flex flex-col gap-2 mt-2">
                            {message.attachments.map((attachment, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                {attachment.type.startsWith("image/") ? (
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block max-w-xs rounded-lg overflow-hidden border"
                                  >
                                    <img
                                      src={attachment.url}
                                      alt={attachment.name}
                                      className="max-h-48 w-auto object-contain"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      "flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-accent transition-colors",
                                      message.sender === "me"
                                        ? "bg-primary/20 border-primary/30"
                                        : "bg-muted"
                                    )}
                                  >
                                    <File className="h-4 w-4" />
                                    <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.sender === "me" && (
                        <span className="mr-1 text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="border-t bg-background p-4">
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border text-sm"
                >
                  {attachment.type.startsWith("image/") ? (
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <File className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="truncate max-w-[150px]">{attachment.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2 rounded-xl border bg-muted/30 p-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.txt,.xls,.xlsx"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-muted-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFiles}
            >
              {uploadingFiles ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Paperclip className="h-5 w-5" />
              )}
            </Button>
            <Input
              className="min-h-[40px] border-0 bg-transparent py-2 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Type your message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={handleSendMessage}
              disabled={(!messageInput.trim() && attachments.length === 0) || uploadingFiles}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Channel Dialog */}
      <Dialog open={!!editingChannel} onOpenChange={(open) => !open && setEditingChannel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
            <DialogDescription>
              Update the channel name for {editingChannel?.organizationName || editingChannel?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                value={editChannelName}
                onChange={(e) => setEditChannelName(e.target.value)}
                placeholder="Enter channel name"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && editChannelName.trim()) {
                    handleEditChannel();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingChannel(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditChannel} disabled={!editChannelName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Channel Confirmation */}
      <AlertDialog open={!!deletingChannel} onOpenChange={(open) => !open && setDeletingChannel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the channel "{deletingChannel?.name}" and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChannel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Channel Info Dialog */}
      <Dialog open={showChannelInfo} onOpenChange={setShowChannelInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Channel Information</DialogTitle>
            <DialogDescription>Details about this channel</DialogDescription>
          </DialogHeader>
          {activeChannel && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Channel Name</Label>
                <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{activeChannel.name}</p>
                  {activeChannel.name === "Atliso Support Team" && (
                    <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Organization</Label>
                <p className="text-sm font-medium">{activeChannel.organizationName || "N/A"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <p className="text-sm font-medium capitalize">{activeChannel.type || "Support"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Last Message</Label>
                <p className="text-sm text-muted-foreground">
                  {formatRelativeTime(activeChannel.lastMessageTime)}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Message Count</Label>
                <p className="text-sm text-muted-foreground">{messages?.length || 0} messages</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChannelInfo(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

