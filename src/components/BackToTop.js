export default function BackToTop(props) {
    return (
        <a href={props.loc}>
            <button className="fixed z-30 bottom-10 right-10 mr-5 bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-800 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>
        </a>
    )
}