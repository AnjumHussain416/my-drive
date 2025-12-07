import Loader from "@/components/common/Loader";

export default function Loading() {
  return (
    <div className="relative min-h-[320px] flex items-center justify-center">
      <Loader lang="default" />
    </div>
  );
}
