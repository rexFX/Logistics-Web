import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import localforage from "localforage";
import { ReactComponent as Loading } from "../../assets/loading.svg";

const Login = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = (event) => {
		event.preventDefault();
		setLoading(true);
		axios
			.post(import.meta.env.VITE_BACKEND + "/api/login", {
				email: email,
				password: password,
			})
			.then((res) => {
				const { token, details } = res.data;
				localforage.setItem("name", details.name);
				localforage.setItem("email", details.email);
				localforage.setItem("role", details.role);
				localforage.setItem("address", details.address);
				localforage.setItem("token", token).then(() => {
					setError("");
					setLoading(false);
					if (details.role === "manufacturer") {
						navigate("/manufacturer");
					} else if (details.role === "transporter") {
						navigate("/transporter");
					} else {
						setError("Invalid user type");
					}
				});
			})
			.catch((err) => {
				setError(err.response.data.message);
				setLoading(false);
			});
	};

	const handleRegister = () => {
		navigate("/register");
	};

	return (
		<div className="shadow-2xl shadow-left h-full w-full flex flex-col justify-center items-center bg-[#ECEFF4] bg-opacity-[75%] md:w-[35%]">
			<div className="p-4 h-[60%] w-full flex flex-col justify-end items-center">
				<h1 className="font-poppins font-bold text-4xl">Welcome Back</h1>
				<div className="mt-2">
					<form className="h-full flex flex-col justify-center items-center mt-5">
						<input
							id="email"
							name="email"
							type="email"
							value={email}
							className="p-3
								block
								w-full
								rounded-md
								border-gray-300
								shadow-sm
								outline-0
								font-noto
								focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
							placeholder="Email Address"
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
						<input
							id="password"
							name="password"
							type="password"
							value={password}
							className="p-3 m-2
								block
								w-full
								rounded-md
								border-gray-300
								shadow-sm
								outline-0
								font-noto
								focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
							placeholder="Password"
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
						<button
							className="flex justify-center items-center w-[80%] bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors"
							onClick={handleLogin}
						>
							{loading ? <Loading fill="white" /> : "Log in"}
						</button>
						{error.length > 0 && <p className="text-red-500 font-noto">{error}</p>}
					</form>
				</div>
			</div>
			<div className="flex-1 mt-3 w-[80%] border-t-2 border-t-[#D8DEE9] flex flex-col justify-start items-center">
				<label className="block text-left mt-12 font-noto" htmlFor="register">
					{"Don't"} have an account?
				</label>
				<button id="register" className="w-[40%] bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors" onClick={handleRegister}>
					Register
				</button>
			</div>
		</div>
	);
};

export default Login;
