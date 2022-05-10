
export default function Navbar() {
    return (
        <div>
            <nav className='bg-black flex justify-between text-white items-center px-8 py-3 rounded-b-full drop-shadow-xl'>
                <a href="/">
                    <button className='flex'>
                        <svg xmlns="http://www.w3.org/2000/svg" className="lg:h-9 lg:w-9 md:h-8 md:w-8 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>


                        <button className='font-semibold text-indigo-600 lg:text-2xl lg:ml-3 md:text-2xl md:ml-2 sm:text-xl sm:ml-2'>DappNet</button>

                    </button>
                </a>


                <div className='flex justify-between lg:w-1/4 md:w-1/2 sm:w-3/4'>
                    <a href="/">
                        <button className="hover:text-indigo-600">Explore</button>
                    </a>
                    <a href="activity">
                        <button className="hover:text-indigo-600">Your Activity</button>
                    </a>
                    <a href="profile">
                        <button className="hover:text-indigo-600">Your Profile</button>
                    </a>
                </div>
            </nav>

        </div>
    )
}