import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

const App = () => {
	useEffect(() => {
		axios.get(import.meta.env.VITE_BACKEND).then((res) => console.log(res.data));
	}, []);

	return (
		<div className="h-screen w-screen bg-bgImage bg-cover bg-center flex justify-end">
			<Outlet />
		</div>
	);
};

export default App;
