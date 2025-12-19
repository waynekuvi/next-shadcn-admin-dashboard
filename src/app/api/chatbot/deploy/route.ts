import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-compat";

const VERCEL_ACCESS_TOKEN = "tErvCe0xiVf2kn8eiTRC0Laf";
const WIDGET_PROJECT_NAME = "uplinq-chat-widget";
const TEAM_ID = "team_po6PtX1SBJhzmCzFTcHwN5r4"; // From API response

// Option 1: Use Deploy Hook (recommended - get this from Vercel dashboard)
// Go to: Project Settings > Git > Deploy Hooks
// Create a hook and paste the URL here
// You can also hardcode it temporarily for testing:
// const DEPLOY_HOOK_URL = "https://api.vercel.com/v1/integrations/deploy/...";
const DEPLOY_HOOK_URL = process.env.VERCEL_DEPLOY_HOOK_URL || null;

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    
    // Allow ADMIN or organization owners (check will be done in the calling component)
    // This endpoint can be called by any authenticated user, but typically only owners will have access

    // Method 1: Use Deploy Hook (simplest and most reliable)
    if (DEPLOY_HOOK_URL) {
      console.log("Using Deploy Hook to trigger deployment...");
      const hookRes = await fetch(DEPLOY_HOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (hookRes.ok) {
        const hookData = await hookRes.json().catch(() => ({}));
        console.log("Deployment triggered via Deploy Hook:", hookData);
        return NextResponse.json({
          success: true,
          method: "deploy_hook",
          deploymentId: hookData.deploymentId || "pending",
          message: "Deployment triggered successfully via Deploy Hook",
        });
      } else {
        const errorData = await hookRes.json().catch(() => ({}));
        console.error("Deploy Hook error:", errorData);
        // Fall through to API method
      }
    }

    // Method 2: Use Vercel API with gitSource construction
    // Get the project to find its ID and latest deployment
    const projectRes = await fetch(
      `https://api.vercel.com/v9/projects/${WIDGET_PROJECT_NAME}?teamId=${TEAM_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!projectRes.ok) {
      const errorData = await projectRes.json().catch(() => ({}));
      console.error("Failed to get project:", errorData);
      throw new Error(`Failed to get Vercel project: ${errorData.message || projectRes.statusText}`);
    }

    const project = await projectRes.json();
    const projectId = project.id;

    // Get the latest production deployment
    const latestDeployment = project.latestDeployments?.find(
      (d: any) => d.target === "production"
    ) || project.latestDeployments?.[0];
    
    if (!latestDeployment) {
      throw new Error("No deployments found for project");
    }

    // Try to get repository info from project link or construct from metadata
    // For now, we'll try to trigger a redeploy of the latest deployment
    // by using the deployment's Git commit info
    const gitCommitSha = latestDeployment.meta?.gitCommitSha;
    const gitCommitRef = latestDeployment.meta?.gitCommitRef || "main";

    if (!gitCommitSha) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot trigger deployment: No Git commit information available.",
          suggestion: "Please set up a Vercel Deploy Hook in Project Settings > Git > Deploy Hooks and add VERCEL_DEPLOY_HOOK_URL to your environment variables.",
        },
        { status: 400 }
      );
    }

    // Try to trigger deployment using the latest commit
    // Note: This requires the repository to be linked to Vercel
    // We'll use the project's Git connection to trigger from latest commit
    const deployRes = await fetch(
      `https://api.vercel.com/v13/deployments?teamId=${TEAM_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: WIDGET_PROJECT_NAME,
          project: projectId,
          target: "production",
          // Vercel will use the latest commit from the connected Git repo
        }),
      }
    );

    if (!deployRes.ok) {
      const errorData = await deployRes.json().catch(() => ({}));
      console.error("Deployment API error:", errorData);
      
      return NextResponse.json(
        {
          success: false,
          message: "Failed to trigger deployment via API",
          error: errorData.error?.message || errorData.message || "Unknown error",
          suggestion: "Please set up a Vercel Deploy Hook in Project Settings > Git > Deploy Hooks. This is the recommended method for triggering deployments programmatically.",
          details: errorData,
        },
        { status: 400 }
      );
    }

    const deployment = await deployRes.json();
    console.log("Deployment triggered successfully:", deployment.id);
    
    return NextResponse.json({
      success: true,
      method: "api",
      deploymentId: deployment.id,
      url: deployment.url,
      status: deployment.readyState,
      alias: deployment.alias,
    });
  } catch (error: any) {
    console.error("Error triggering Vercel deployment:", error);
    return NextResponse.json(
      {
        message: "Failed to trigger deployment",
        error: error?.message || "Unknown error",
        suggestion: "Consider setting up a Vercel Deploy Hook for more reliable deployments.",
      },
      { status: 500 }
    );
  }
}

