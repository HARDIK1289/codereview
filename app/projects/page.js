import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import ProjectList from "@/components/dashboard/ProjectList";

export default async function ProjectsPage() {
  // 1. Get User Session
  const session = await getServerSession(authOptions);

  // 2. Redirect if not logged in
  if (!session) {
    redirect("/login");
  }

  // 3. Render the Page
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:pl-72">
      <div className="max-w-6xl mx-auto space-y-8 pt-6">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Select a Repository</h1>
          <p className="text-slate-400">
            Choose a project to analyze. We will scan your code and generate an AI report.
          </p>
        </div>

        {/* Client Component: List of Repos */}
        <ProjectList username={session.user.username} />
        
      </div>
    </div>
  );
}