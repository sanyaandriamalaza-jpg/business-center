import Loader from "@/src/assets/svg/loader.svg";

export default function PartialLoading() {
  return (
    <div className="flex gap-2 items-center w-full justify-center">
      <Loader className="text-cDefaultPrimary-100 animate-spin w-[20px] h-[20px] " />
      <p className="text-center italic text-sm text-cDefaultPrimary-100">
        Chargement des données...
      </p>
    </div>
  );
}