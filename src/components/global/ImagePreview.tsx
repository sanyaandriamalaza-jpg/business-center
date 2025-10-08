export default function ImagePreview ({ imageUrl, deleteImage, isGallery = false }: { imageUrl: string, deleteImage: () => void, isGallery?: boolean }) {
    return (
        <div className={`relative ${isGallery ? "w-full aspect-video" : ""}`} >
            <img src={`${imageUrl}`} width={160 * 2} height={90 * 2} alt="" className={`${isGallery ? "w-full h-full object-cover object-center" : ""}`} />
            <button onClick={(e) => {
                e.preventDefault()
                deleteImage()
            }} className="absolute left-1 top-1 text-sm bg-red-100 hover:bg-red-500 hover:text-white text-red-500 px-3 py-1 rounded-md">
                Supprimer
            </button>
        </div>
    )
}