import { Construction } from "lucide-react";

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <div className="bg-blue-100 p-4 rounded-full mb-4">
        <Construction className="h-8 w-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md">
        {description || "This feature is currently under development and will be available in a future update."}
      </p>
    </div>
  );
}
