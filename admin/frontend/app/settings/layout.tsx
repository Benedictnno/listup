import DashboardLayout from "@/components/layout/DashboardLayout";
import SettingsNav from "@/components/settings/SettingsNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 flex-shrink-0">
            <SettingsNav />
          </div>
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}