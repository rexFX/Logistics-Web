import { Outlet } from "react-router-dom";

const App = () => {
	return (
		<div className="h-screen w-screen bg-bgImage bg-cover bg-center flex justify-end">
			<Outlet />
		</div>
	);
};

export default App;
