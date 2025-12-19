import { prisma } from "@/lib/db";
import { ClientEditor } from "./_components/client-editor";
import { notFound } from "next/navigation";

export default async function OrganizationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const organization = await prisma.organization.findUnique({
    where: { id },
  });

  if (!organization) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div>
      </div>
      
      <ClientEditor organization={organization} />
    </div>
  );
}
