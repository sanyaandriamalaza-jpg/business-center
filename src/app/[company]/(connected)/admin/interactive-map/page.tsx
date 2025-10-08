import InteractiveMapPageWrapper from "./InteractiveMapPageWrapper";
interface Props {
  searchParams: { mode?: string; id?: string };
}
export default function InteractiveMap({ searchParams }: Props) {
  const mode = searchParams.mode;
  const id = searchParams.id;

  const idFormated = Number(id);

  return (
    <InteractiveMapPageWrapper
      mode={mode}
      id={!isNaN(idFormated) ? idFormated : null}
    />
  );
}
