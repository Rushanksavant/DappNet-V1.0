import Background from "../components/Background";
import Navbar from "../components/Navbar";
import BackToTop from "../components/BackToTop";
import EventLogs from "../components/EventLogs"

export default function YourActivity() {
    return (
        <div className="bg-gray-900 h-screen overflow-auto">

            <Navbar />

            <EventLogs />

            <Background />
            <BackToTop loc="activity" />

        </div>
    );
}
