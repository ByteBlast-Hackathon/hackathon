import HelpButton from "@/components/shared/HelpButton";
import useAuthGuard from "@/lib/useAuthGuard";

export default function Home() {
  useAuthGuard();

  return (
    <div className="text-black relative">
    </div>
  );
}
