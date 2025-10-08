import HomePageWrapper from "./HomePageWrapper";


export default async function Home({ params }: { params: Promise<{ company: string }> }) {

  return (
    <HomePageWrapper />
  )
}