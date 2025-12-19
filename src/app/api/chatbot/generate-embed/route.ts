import { NextResponse } from "next/server";

type GenerateEmbedRequest = {
  organizationId: string;
  webhookUrl: string;
  apiBaseUrl?: string;
  widgetUrl?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<GenerateEmbedRequest>;
    const { organizationId, webhookUrl, apiBaseUrl, widgetUrl } = body;

    if (!organizationId || !webhookUrl) {
      return NextResponse.json(
        { message: "organizationId and webhookUrl are required" },
        { status: 400 }
      );
    }

    const resolvedApiBase =
      (apiBaseUrl || process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "").replace(/\/$/, "");

    const resolvedWidgetUrl =
      widgetUrl ||
      process.env.NEXT_PUBLIC_WIDGET_URL ||
      "https://uplinq-chat-widget-eight.vercel.app/uplinq-chat-widget.umd.js";

    // Production embed code - no initialOpen/hideButton (those are preview-only)
    const embedCode = `<div id="uplinq-chat-root"></div>
<script>
(function() {
  const script = document.createElement('script');
  script.src = '${resolvedWidgetUrl}';
  script.onload = function() {
    if (window.UplinqChatWidget) {
      window.UplinqChatWidget.mount('#uplinq-chat-root', {
        organizationId: '${organizationId}',
        apiBaseUrl: '${resolvedApiBase}',
        webhookUrl: '${webhookUrl}'
      });
    }
  };
  document.head.appendChild(script);
})();
</script>`;

    return NextResponse.json({ embedCode });
  } catch (error: any) {
    console.error("Error generating chatbot embed code:", error);
    return NextResponse.json(
      { message: "Failed to generate embed code", error: error?.message },
      { status: 500 }
    );
  }
}




