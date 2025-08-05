// app/(admin)/contacts/page.tsx

import { getContactSubmissions } from "@/app/actions/admin-actions";
import { columns } from "@/components/contacts/columns";
import { DataTable } from "@/components/ui/dataTable";

export default async function ContactSubmissionsPage() {
  const submissions = await getContactSubmissions();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-light-text-default dark:text-dark-text-default">
          Contact Submissions
        </h1>
        <p className="text-md text-dark-text-secondary dark:text-light-text-secondary">
          View and manage messages from users.
        </p>
      </div>
      <DataTable columns={columns} data={submissions} />
    </div>
  );
}
