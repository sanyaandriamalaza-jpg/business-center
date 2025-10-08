import { useEffect } from "react"

export default function OverlayComponent({ closeOverlay }: { closeOverlay: () => void }) {
    useEffect(() => {
        document.body.classList.add('overflow-hidden')
        return () => {
            document.body.classList.remove('overflow-hidden')
        }
    }, [])
    return (
        <div onClick={() => {
            document.body.classList.remove('overflow-hidden')
            closeOverlay()
        }} className="fixed top-0 left-0 bottom-0 right-0 bg-black/10 z-30">

        </div>
    )
}