"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Loader2 } from "lucide-react";
import { EmbedCodeModal } from "@/components/chatbot/embed-code-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Inbox,
  MessageSquare,
  ChevronDown,
  Maximize2,
  File as FileIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type GradientConfig = {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
};

interface Conversation {
  id: string;
  customerName: string;
  avatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  metadata?: string | null;
  messageCount: number;
  organizationId: string;
  organizationName: string;
}

interface Message {
  id: string;
  sender: "me" | "them";
  senderName?: string;
  senderImage?: string | null;
  senderRole?: string;
  content: string;
  timestamp: string;
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
    size: number;
  }>;
}

interface ConversationResponse {
  conversations: Conversation[];
  counts: {
    inbox: number;
    all: number;
  };
}

interface ChatbotPageClientProps {
  organizationId: string;
  organizationName: string;
  chatbotEmbedCode: string | null;
  initialGradient: GradientConfig;
  initialAvatars: string[];
  initialBrandLogo: string | null;
  isOwner: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return "";
  }
  return formatDistanceToNow(date, { addSuffix: false })
    .replace("about ", "")
    .replace(" hours", "h")
    .replace(" hour", "h")
    .replace(" minutes", "m")
    .replace(" minute", "m");
};

const gradientPresets = [
  {
    id: "atliso-default",
    label: "Atliso Default",
    colors: { color1: "#1e5eff", color2: "#5860f4", color3: "#7c3aed", color4: "#dcd6ff" },
  },
  {
    id: "midnight-pulse",
    label: "Midnight Pulse",
    colors: { color1: "#6366f1", color2: "#8b5cf6", color3: "#a855f7", color4: "#c084fc" },
  },
  {
    id: "aurora-mint",
    label: "Aurora Mint",
    colors: { color1: "#0ea5e9", color2: "#14b8a6", color3: "#0d9488", color4: "#a7f3d0" },
  },
  {
    id: "sunset-bloom",
    label: "Sunset Bloom",
    colors: { color1: "#f97316", color2: "#fb7185", color3: "#ec4899", color4: "#fbcfe8" },
  },
  {
    id: "orchid-dream",
    label: "Orchid Dream",
    colors: { color1: "#c026d3", color2: "#e879f9", color3: "#f0abfc", color4: "#fae8ff" },
  },
];

const colorFields: { key: keyof GradientConfig; label: string }[] = [
  { key: "color1", label: "Color 1 (Top)" },
  { key: "color2", label: "Color 2" },
  { key: "color3", label: "Color 3" },
  { key: "color4", label: "Color 4 (Bottom)" },
];

export function ChatbotPageClient({
  organizationId,
  organizationName,
  chatbotEmbedCode,
  initialGradient,
  initialAvatars,
  initialBrandLogo,
  isOwner,
}: ChatbotPageClientProps) {
  const router = useRouter();
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const previewGradientRef = useRef<GradientConfig>(initialGradient);
  const previewAvatarsRef = useRef<string[]>(initialAvatars);
  const previewBrandLogoRef = useRef<string | null>(initialBrandLogo);
  const [previewGradient, setPreviewGradient] = useState<GradientConfig>(initialGradient);
  const [savedGradient, setSavedGradient] = useState<GradientConfig>(initialGradient);
  const [previewAvatars, setPreviewAvatars] = useState<string[]>(initialAvatars);
  const [savedAvatars, setSavedAvatars] = useState<string[]>(initialAvatars);
  const [previewBrandLogo, setPreviewBrandLogo] = useState<string | null>(initialBrandLogo);
  const [savedBrandLogo, setSavedBrandLogo] = useState<string | null>(initialBrandLogo);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCustomColorsOpen, setIsCustomColorsOpen] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [generatedEmbedCode, setGeneratedEmbedCode] = useState("");
  
  // Conversation state
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationFilter, setConversationFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  // Fetch conversations
  const conversationsKey = `/api/chatbot/conversations?organizationId=${organizationId}&filter=${conversationFilter}`;
  const { data: conversationsData, isLoading: conversationsLoading } = useSWR<ConversationResponse>(
    conversationsKey,
    fetcher,
    {
      refreshInterval: 10000,
    }
  );

  const conversations = conversationsData?.conversations || [];
  const counts = conversationsData?.counts || {
    inbox: 0,
    all: 0,
  };

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.customerName.toLowerCase().includes(query) ||
        c.lastMessage?.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  // Get selected conversation
  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  // Fetch messages for selected conversation
  const messagesKey = selectedConversationId
    ? `/api/channels/${selectedConversationId}/messages`
    : null;
  const { data: messagesData, isLoading: messagesLoading } = useSWR(
    messagesKey,
    fetcher,
    {
      refreshInterval: 5000,
    }
  );
  const messages: Message[] = messagesData?.messages || [];

  // Keep refs in sync
  useEffect(() => {
    previewGradientRef.current = previewGradient;
  }, [previewGradient]);

  useEffect(() => {
    previewAvatarsRef.current = previewAvatars;
  }, [previewAvatars]);

  useEffect(() => {
    previewBrandLogoRef.current = previewBrandLogo;
  }, [previewBrandLogo]);

  const buildGradient = useCallback((colors: GradientConfig) => {
    return `linear-gradient(180deg, ${colors.color1} 0%, ${colors.color2} 35%, ${colors.color3} 65%, ${colors.color4} 100%)`;
  }, []);

  const gradientsMatch = useCallback((a: GradientConfig, b: GradientConfig) => {
    return (
      a.color1.toLowerCase() === b.color1.toLowerCase() &&
      a.color2.toLowerCase() === b.color2.toLowerCase() &&
      a.color3.toLowerCase() === b.color3.toLowerCase() &&
      a.color4.toLowerCase() === b.color4.toLowerCase()
    );
  }, []);

  const hasUnsavedChanges = useMemo(() => {
    const gradientChanged = !gradientsMatch(previewGradient, savedGradient);
    const avatarsChanged = JSON.stringify(previewAvatars) !== JSON.stringify(savedAvatars);
    const logoChanged = previewBrandLogo !== savedBrandLogo;
    return gradientChanged || avatarsChanged || logoChanged;
  }, [previewGradient, savedGradient, previewAvatars, savedAvatars, previewBrandLogo, savedBrandLogo, gradientsMatch]);

  const applyGradientToShadow = useCallback((shadowRoot: ShadowRoot, gradient: GradientConfig) => {
    const chatHeader = shadowRoot.querySelector(".chat-header") as HTMLElement | null;
    if (chatHeader) {
      chatHeader.style.background = buildGradient(gradient);
    }
  }, [buildGradient]);

  const handlePresetSelect = useCallback((colors: GradientConfig) => {
    setPreviewGradient(colors);
    if (shadowRootRef.current) {
      applyGradientToShadow(shadowRootRef.current, colors);
    }
  }, [applyGradientToShadow]);

  const handleColorChange = useCallback((key: keyof GradientConfig, value: string) => {
    if (!value) return;
    const normalized = value.startsWith("#") ? value : `#${value}`;
    setPreviewGradient((prev) => ({
      ...prev,
      [key]: normalized,
    }));
  }, []);

  const regenerateEmbedCodeWithCustomization = useCallback((
    originalEmbedCode: string | null,
    gradient: GradientConfig,
    avatars: string[],
    logo: string | null
  ): string => {
    const webhookMatch = originalEmbedCode?.match(/webhookUrl:\s*['"]([^'"]+)['"]/);
    const webhookUrl = webhookMatch ? webhookMatch[1] : 'https://uplinq.app.n8n.cloud/webhook/chatbot';

    const widgetUrl =
      (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_WIDGET_URL : undefined) ||
      "https://uplinq-chat-widget-eight.vercel.app/uplinq-chat-widget.umd.js";
    
    const config = {
      webhookUrl,
      customization: {
        gradient: {
          color1: gradient.color1,
          color2: gradient.color2,
          color3: gradient.color3,
          color4: gradient.color4,
        },
        avatars: avatars.length > 0 ? avatars : undefined,
        logo: logo || undefined,
      }
    };
    
    const scriptContent = `(function() {
  const script = document.createElement('script');
  script.src = '${widgetUrl}';
  script.onload = function() {
    if (window.UplinqChatWidget) {
      window.UplinqChatWidget.mount('#uplinq-chat-root', ${JSON.stringify(config, null, 2)});
    }
  };
  document.head.appendChild(script);
})();`;
    
    return `<div id="uplinq-chat-root"></div>\n<script>${scriptContent}</script>`;
  }, []);

  const handlePublish = useCallback(async () => {
    if (!isOwner || isPublishing) return;
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/organization/${organizationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatbotGradientColor1: previewGradient.color1,
          chatbotGradientColor2: previewGradient.color2,
          chatbotGradientColor3: previewGradient.color3,
          chatbotGradientColor4: previewGradient.color4,
          chatbotAvatars: previewAvatars,
          chatbotBrandLogo: previewBrandLogo,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to publish customization");
      }

      const updatedEmbedCode = regenerateEmbedCodeWithCustomization(
        chatbotEmbedCode,
        previewGradient,
        previewAvatars,
        previewBrandLogo
      );

      const embedRes = await fetch(`/api/organization/${organizationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatbotEmbedCode: updatedEmbedCode,
        }),
      });

      if (!embedRes.ok) {
        const data = await embedRes.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to update embed code");
      }

      setSavedGradient(previewGradient);
      setSavedAvatars(previewAvatars);
      setSavedBrandLogo(previewBrandLogo);

      setGeneratedEmbedCode(updatedEmbedCode);
      setShowEmbedModal(true);

      router.refresh();
      toast.success("Customization published successfully!");
    } catch (error: any) {
      console.error("Failed to publish customization", error);
      toast.error(error?.message || "Unable to publish customization");
    } finally {
      setIsPublishing(false);
    }
  }, [isOwner, isPublishing, organizationId, previewGradient, previewAvatars, previewBrandLogo, chatbotEmbedCode, regenerateEmbedCodeWithCustomization, router]);

  // Mount widget for preview
  useEffect(() => {
    if (!showPreview || !chatbotEmbedCode || !embedContainerRef.current) {
      return;
    }
    
    embedContainerRef.current.innerHTML = "";
    
    const cacheBuster = `?v=${Date.now()}`;
    const widgetUrl = `https://uplinq-chat-widget-eight.vercel.app/uplinq-chat-widget.umd.js${cacheBuster}`;
    
    let updatedEmbedCode = chatbotEmbedCode.replace(
      /https:\/\/uplinq-chat-widget[^'"]+\.vercel\.app\/uplinq-chat-widget\.umd\.js(\?v=\d+)?/g,
      widgetUrl
    );
    
    embedContainerRef.current.innerHTML = updatedEmbedCode;
    
    const scripts = embedContainerRef.current.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      let scriptContent = oldScript.textContent || "";
      
      if (scriptContent.includes('UplinqChatWidget.mount')) {
        const webhookMatch = scriptContent.match(/webhookUrl:\s*['"]([^'"]+)['"]/);
        const webhookUrl = webhookMatch ? webhookMatch[1] : 'https://uplinq.app.n8n.cloud/webhook/chatbot';
        
        const customization: any = {
          gradient: {
            color1: previewGradientRef.current.color1,
            color2: previewGradientRef.current.color2,
            color3: previewGradientRef.current.color3,
            color4: previewGradientRef.current.color4,
          },
        };
        
        if (previewAvatarsRef.current.length > 0) {
          customization.avatars = previewAvatarsRef.current;
        }
        
        if (previewBrandLogoRef.current) {
          customization.logo = previewBrandLogoRef.current;
        }
        
        scriptContent = scriptContent.replace(
          /UplinqChatWidget\.mount\(['"]#uplinq-chat-root['"],\s*\{([^}]*)\}\)/g,
          () => {
            return `UplinqChatWidget.mount('#uplinq-chat-root', {
              webhookUrl: '${webhookUrl}',
              initialOpen: true,
              hideButton: true,
              customization: ${JSON.stringify(customization)}
            })`;
          }
        );
        
        scriptContent = scriptContent.replace(
          /UplinqChatWidget\.mount\(['"]#uplinq-chat-root['"]\)/g,
          `UplinqChatWidget.mount('#uplinq-chat-root', {
            webhookUrl: '${webhookUrl}',
            initialOpen: true,
            hideButton: true,
            customization: ${JSON.stringify(customization)}
          })`
        );
      }
      
      newScript.textContent = scriptContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
    
    let attempts = 0;
    const ensureWidgetOpen = setInterval(() => {
      attempts++;
      const host = embedContainerRef.current?.querySelector(".uplinq-chat-widget-host") as HTMLElement | null;
      const shadowRoot = host?.shadowRoot;
      if (shadowRoot) {
        shadowRootRef.current = shadowRoot;
        applyGradientToShadow(shadowRoot, previewGradientRef.current);
        
        let styleElement = shadowRoot.querySelector("style#keep-open-style") as HTMLStyleElement | null;
        if (!styleElement) {
          styleElement = document.createElement("style");
          styleElement.id = "keep-open-style";
          styleElement.textContent = `
            .chat-button {
              display: none !important;
              visibility: hidden !important;
              pointer-events: none !important;
            }
            .chat-widget {
              position: relative !important;
              bottom: auto !important;
              right: auto !important;
              width: 100% !important;
              height: 100% !important;
              z-index: 1 !important;
            }
            .chat-container {
              display: flex !important;
              position: relative !important;
              bottom: auto !important;
              right: auto !important;
              width: 100% !important;
              height: 990px !important;
              max-height: 100% !important;
              border-radius: 12px !important;
              box-shadow: none !important;
            }
            .chat-container.active {
              display: flex !important;
            }
            .header-close-btn,
            #backBtn,
            [class*='close'],
            [class*='back'] {
              display: none !important;
              visibility: hidden !important;
              pointer-events: none !important;
            }
          `;
          shadowRoot.appendChild(styleElement);
        }
        
        const chatButton = shadowRoot.querySelector(".chat-button") as HTMLElement | null;
        if (chatButton) {
          chatButton.style.display = "none";
        }
        
        const chatContainer = shadowRoot.querySelector(".chat-container") as HTMLElement | null;
        if (chatContainer) {
          chatContainer.classList.add("active");
          chatContainer.style.display = "flex";
        }
        
        if (chatContainer && attempts > 5) {
          clearInterval(ensureWidgetOpen);
        }
      } else if (attempts > 20) {
        clearInterval(ensureWidgetOpen);
      }
    }, 250);
    
    return () => {
      clearInterval(ensureWidgetOpen);
    };
  }, [chatbotEmbedCode, showPreview, applyGradientToShadow]);

  // If no embed code, show setup state
  if (!chatbotEmbedCode) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/10">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Configure Your Chatbot</h2>
          <p className="text-muted-foreground">
            Please configure the chatbot embed code in the organization settings to view the preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-background text-sm">
      {/* 1. Navigation Column (Left) */}
      <div className="w-[240px] flex flex-col border-r bg-card/50 hidden xl:flex">
        <div className="p-4 flex items-center justify-between">
          <div className="font-semibold text-lg">Inbox</div>
          <Search 
            className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" 
            onClick={() => {
              const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
              searchInput?.focus();
            }}
          />
        </div>
        <ScrollArea className="flex-1">
          <div className="px-2 space-y-1 py-2">
            <div 
              className={cn(
                "flex items-center justify-between px-2 py-1.5 text-muted-foreground hover:bg-muted/50 rounded-md cursor-pointer",
                conversationFilter === "all" && "bg-muted/50 text-foreground font-medium"
              )}
              onClick={() => setConversationFilter("all")}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <span>All Chats</span>
              </div>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{counts.all}</span>
            </div>
            
            <div 
              className={cn(
                "flex items-center justify-between px-2 py-1.5 text-muted-foreground hover:bg-muted/50 rounded-md cursor-pointer",
                conversationFilter === "open" && "bg-muted/50 text-foreground font-medium"
              )}
              onClick={() => setConversationFilter("open")}
            >
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                <span>Unread</span>
              </div>
              {counts.inbox > 0 && (
                <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">{counts.inbox}</span>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* 2. Conversation List Column */}
      <div className="w-[320px] flex flex-col border-r bg-background hidden md:flex">
        <div className="h-14 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-1 text-sm font-medium">
            {conversationsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>{filteredConversations.length} {conversationFilter === "open" ? "Unread" : "Chats"}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">Newest first</span>
        </div>
        
        <div className="px-4 py-2 border-b">
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        
        <ScrollArea className="flex-1">
          {conversationsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No conversations match your search" : "No chatbot conversations yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conversation) => {
                const isSelected = selectedConversationId === conversation.id;
                const initials = conversation.customerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();
                const avatarColors = [
                  "bg-blue-100 text-blue-600",
                  "bg-emerald-100 text-emerald-600",
                  "bg-amber-100 text-amber-600",
                  "bg-teal-100 text-teal-600",
                  "bg-purple-100 text-purple-600",
                  "bg-pink-100 text-pink-600",
                ];
                const colorIndex = conversation.id.charCodeAt(0) % avatarColors.length;
                
                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                      isSelected && "bg-muted"
                    )}
                    onClick={() => {
                      setSelectedConversationId(conversation.id);
                      setShowPreview(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className={cn("h-10 w-10", avatarColors[colorIndex])}>
                        {conversation.avatar ? (
                          <AvatarImage src={conversation.avatar} alt={conversation.customerName} />
                        ) : null}
                        <AvatarFallback className={avatarColors[colorIndex]}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium truncate">{conversation.customerName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 font-medium">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* 3. Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/10">
        <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            {selectedConversation && !showPreview ? (
              <>
                <Avatar className="h-8 w-8">
                  {selectedConversation.avatar && (
                    <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerName} />
                  )}
                  <AvatarFallback>
                    {selectedConversation.customerName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-semibold text-lg">{selectedConversation.customerName}</span>
                </div>
              </>
            ) : (
              <>
                <span className="font-semibold text-lg">Chatbot Preview</span>
                <span className="text-sm text-muted-foreground">({organizationName})</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {selectedConversation && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "View Conversation" : "View Preview"}
              </Button>
            )}
            <Button
              size="sm"
              variant="default"
              className="bg-black hover:bg-gray-800 text-white"
              onClick={handlePublish}
              disabled={!isOwner || isPublishing || !hasUnsavedChanges}
            >
              {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish
            </Button>
          </div>
        </header>

        {selectedConversation && !showPreview ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6">
              <div className="flex flex-col gap-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !messages || messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-sm text-muted-foreground">No messages in this conversation yet</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.sender === "me";
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3 max-w-[80%]",
                          isMe && "ml-auto flex-row-reverse"
                        )}
                      >
                        {!isMe && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={message.senderImage || undefined} />
                            <AvatarFallback>
                              {message.senderName?.substring(0, 2).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn("flex flex-col gap-1", isMe && "items-end")}>
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2 max-w-full",
                              isMe
                                ? "bg-blue-500 text-white rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          </div>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {message.attachments.map((att, idx) => (
                                <a
                                  key={idx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                                >
                                  <FileIcon className="h-3 w-3" />
                                  {att.name}
                                </a>
                              ))}
                            </div>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden relative bg-muted/10 p-4 md:p-6">
            <div 
              ref={embedContainerRef}
              className="w-full h-full relative"
            />
          </div>
        )}
      </div>

      {/* 4. Details Column (Right) */}
      <div className="w-[300px] border-l bg-background flex-col hidden 2xl:flex">
        <div className="h-14 border-b flex items-center justify-between px-4">
          <div className="flex gap-4 text-sm font-medium">
            <span className="text-blue-600 border-b-2 border-blue-600 py-4">Details</span>
            <span className="text-muted-foreground py-4 flex items-center gap-2">
              AI Copilot
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">Coming soon</span>
            </span>
          </div>
          <Maximize2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Chatbot Customization */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Chatbot customization</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tune the gradient background for the embedded widget.
              </p>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground">Preset themes</span>
                <div className="grid grid-cols-1 gap-2">
                  {gradientPresets.map((preset) => {
                    const isActive = gradientsMatch(previewGradient, preset.colors);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={`rounded-2xl border p-3 text-left text-white shadow-sm transition focus:outline-none ${
                          isActive ? "border-blue-500 ring-1 ring-blue-500" : "border-border"
                        }`}
                        style={{ background: buildGradient(preset.colors) }}
                        onClick={() => handlePresetSelect(preset.colors)}
                        disabled={!isOwner}
                      >
                        <div className="font-medium text-sm drop-shadow-sm">{preset.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsCustomColorsOpen(!isCustomColorsOpen)}
                  className="flex items-center justify-between w-full text-left"
                  disabled={!isOwner}
                >
                  <span className="text-xs font-semibold text-muted-foreground">Custom colors</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      isCustomColorsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isCustomColorsOpen && (
                  <div className="space-y-3 pt-1">
                    {colorFields.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={previewGradient[field.key]}
                            onChange={(event) => handleColorChange(field.key, event.target.value)}
                            disabled={!isOwner}
                            className="h-9 w-9 rounded-md border border-border bg-background p-0"
                          />
                          <Input
                            value={previewGradient[field.key]}
                            onChange={(event) => handleColorChange(field.key, event.target.value)}
                            disabled={!isOwner}
                            className="font-mono text-xs uppercase"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Brand Logo */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-muted-foreground uppercase">Brand Logo</span>
              <p className="text-xs text-muted-foreground">
                Set a custom logo URL to display in the chatbot header.
              </p>
              <div className="space-y-2">
                <Label className="text-[11px] text-muted-foreground">Logo URL</Label>
                <Input
                  type="url"
                  value={previewBrandLogo || ""}
                  onChange={(e) => setPreviewBrandLogo(e.target.value || null)}
                  disabled={!isOwner}
                  placeholder="https://example.com/logo.png"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Avatars */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-muted-foreground uppercase">Header Avatars</span>
              <p className="text-xs text-muted-foreground">
                Set up to 3 avatar URLs to display in the chatbot header.
              </p>
              <div className="space-y-3">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Avatar {index + 1}
                    </Label>
                    <Input
                      type="url"
                      value={previewAvatars[index] || ""}
                      onChange={(e) => {
                        const newAvatars = [...previewAvatars];
                        if (e.target.value) {
                          newAvatars[index] = e.target.value;
                        } else {
                          newAvatars.splice(index, 1);
                        }
                        setPreviewAvatars(newAvatars);
                      }}
                      disabled={!isOwner}
                      placeholder={`https://example.com/avatar${index + 1}.png`}
                      className="font-mono text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
      
      <EmbedCodeModal 
        isOpen={showEmbedModal} 
        onClose={() => setShowEmbedModal(false)} 
        embedCode={generatedEmbedCode} 
      />
    </div>
  );
}
