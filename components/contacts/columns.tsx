// app/(admin)/contacts/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ContactSubmissionWithUser,
  updateContactStatus,
} from "@/app/actions/admin-actions";
import { ContactStatus } from "@/app/generated/prisma";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 
import { useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Status Badge Component for styling
const StatusBadge = ({ status }: { status: ContactStatus }) => {
  const statusStyles = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
};

// Status Selector Component for the status column
const StatusSelector = ({ row }: { row: { original: ContactSubmissionWithUser } }) => {
  const [isPending, startTransition] = useTransition();
  const submission = row.original;

  const onStatusChange = (newStatus: ContactStatus) => {
    startTransition(async () => {
      const result = await updateContactStatus(submission.id, newStatus);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Select
      onValueChange={(value: ContactStatus) => onStatusChange(value)}
      defaultValue={submission.status}
      disabled={isPending}
    >
      <SelectTrigger className="w-[150px] text-xs">
        <SelectValue placeholder="Update status..." />
      </SelectTrigger>
      <SelectContent>
        {Object.values(ContactStatus).map((status) => (
          <SelectItem key={status} value={status}>
             <StatusBadge status={status} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const columns: ColumnDef<ContactSubmissionWithUser>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.original.name;
      const registeredUser = row.original.user;
      return (
        <div className="font-medium">
          {name}
          {registeredUser && (
            <span className="ml-2 text-xs font-normal text-primary-default dark:text-primary-light">
              (User)
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    accessorKey: "createdAt",
    header: "Submitted At",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: StatusSelector,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">View Message</Button>
        </DialogTrigger>
        <DialogContent className="bg-light-surface dark:bg-dark-surface">
          <DialogHeader>
            <DialogTitle>{row.original.subject}</DialogTitle>
            <DialogDescription>
              From: {row.original.name} &lt;{row.original.email}&gt;
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 prose prose-sm dark:prose-invert max-w-none max-h-[50vh] overflow-y-auto p-4 bg-light-bg dark:bg-dark-bg rounded-md border border-light-border dark:border-dark-border">
            {row.original.message}
          </div>
        </DialogContent>
      </Dialog>
    ),
  },
];