import { TrashIcon } from "lucide-react";

export default function Logo() {
    return (
        <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                PembsWaste<span className="block text-orange-500">Reminder Service</span>
            </h1>
        </div>
    );
}