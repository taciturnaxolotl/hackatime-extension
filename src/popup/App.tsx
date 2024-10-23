import { useChromeStorageLocal } from "use-chrome-storage";

const Status = () => {
	const [{ message, status }] = useChromeStorageLocal("status", {
		message: "Please enter your token in options",
		status: false,
	});

	return (
		<div className="mt-4 flex flex-col items-center">
			<div className="flex flex-row items-center">
				<h1 className="mr-2 text-primary">Status:</h1>
				<span
					className={`w-6 h-6 rounded-full ${
						status ? "bg-green-500" : "bg-red-500"
					}`}
				/>
			</div>
			<p className="italic text-text-secondary dark:text-text-dark-secondary">
				{message}
			</p>
		</div>
	);
};

export default Status;
