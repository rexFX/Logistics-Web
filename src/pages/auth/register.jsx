import { useState } from "react";
import axios from "axios";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { ReactComponent as Loading } from "../../assets/loading.svg";
import { useNavigate } from "react-router-dom";

const Register = () => {
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [countryCode, setCountryCode] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [address, setAddress] = useState("");
	const [pincode, setPincode] = useState("");
	const [error, setError] = useState("");
	const [checkError, setCheckError] = useState(false);
	const [dropdown, setDropdown] = useState(false);
	const [selectedRole, setSelectedRole] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState("");

	const navigate = useNavigate();

	const registrationHandler = (event) => {
		event.preventDefault();
		setLoading(true);
		setSuccess("");
		axios
			.post(import.meta.env.VITE_BACKEND + "/api/register", {
				name: fullName,
				email: email,
				password: password,
				countryCode: countryCode,
				phone: phoneNumber,
				address: address,
				pincode: pincode,
				role: selectedRole.toLowerCase(),
			})
			.then(() => {
				setSuccess("User Registered Successfully");
				setCheckError(false);
				setLoading(false);
			})
			.catch((err) => {
				setCheckError(true);
				setLoading(false);
				setError(err.response.data.message);
			});
	};

	return (
		<div className="shadow-2xl shadow-left h-full w-full flex flex-col justify-center items-center bg-[#ECEFF4] bg-opacity-[75%] md:w-[45%] lg:w-[35%]">
			<div className="p-4 h-full w-80 flex flex-col justify-center items-center">
				<h1 className="font-poppins font-bold text-4xl">Create Account</h1>
				<div className="mt-2 w-full">
					<form className="h-full flex flex-col justify-center items-center mt-5">
						<input
							id="fullName"
							name="fullName"
							type="text"
							className="p-3
								mb-2
								block
								w-full
								rounded-md
								border-gray-300
								shadow-sm
								outline-0
								font-noto
								focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
							placeholder="Full Name"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							required
						/>
						<input
							id="email"
							name="email"
							type="email"
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
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
						<input
							id="password"
							name="password"
							type="password"
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
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
						<input
							id="address"
							name="address"
							type="text"
							className="p-3
							block
								w-full
								rounded-md
								border-gray-300
								shadow-sm
								outline-0
								font-noto
								focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
							placeholder="Address"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							required
						/>
						<div className="w-full flex justify-between items-center m-2">
							<input
								id="pincode"
								name="pincode"
								type="text"
								className="p-3
								w-24
								rounded-md
								border-gray-300
								shadow-sm
								outline-0
								font-noto
								focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
								placeholder="Pincode"
								value={pincode}
								onChange={(e) => setPincode(e.target.value)}
								required
							/>
							<input
								id="countryCode"
								name="countryCode"
								type="tel"
								className="p-3
								w-14
								rounded-md
								border-gray-300
								shadow-sm
								outline-0
								font-noto
								focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
								placeholder="+91"
								value={countryCode}
								onChange={(e) => setCountryCode(e.target.value)}
								required
							/>
							<input
								id="phone"
								name="phone"
								type="tel"
								className="p-3
								w-32
								rounded-md
								border-gray-300
								shadow-sm
								outline-0
								font-noto
								focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
								placeholder="0123456789"
								value={phoneNumber}
								onChange={(e) => {
									if (e.target.value.length > 10) return;
									else setPhoneNumber(e.target.value);
								}}
								required
							/>
						</div>
						<div className="w-full flex flex-col justify-between items-center relative">
							<button
								className="p-3
								w-full
								rounded-md
								border-gray-300
								shadow-sm
								outline-0
								font-noto
								bg-white
								flex
								justify-between
								items-center
								px-5
								"
								onClick={(e) => {
									e.preventDefault();
									setDropdown(!dropdown);
								}}
							>
								{selectedRole === "" ? <span className="text-gray-400">What should we call you?</span> : <span>{selectedRole}</span>}

								{dropdown ? <FiChevronUp /> : <FiChevronDown />}
							</button>
							{dropdown && (
								<div className="w-full flex flex-col justify-center items-center absolute top-11 rounded-b-lg bg-white">
									<h3
										className="font-noto hover:bg-gray-200 w-full p-3 text-center cursor-pointer"
										onClick={(e) => {
											e.preventDefault();
											setSelectedRole("Transporter");
											setDropdown(false);
										}}
									>
										Transporter
									</h3>
									<h3
										className="font-noto hover:bg-gray-200 w-full p-3 text-center rounded-b-lg cursor-pointer"
										onClick={(e) => {
											e.preventDefault();
											setSelectedRole("Manufacturer");
											setDropdown(false);
										}}
									>
										Manufacturer
									</h3>
								</div>
							)}
						</div>
						<button
							className="w-[80%] bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors flex justify-center items-center"
							onClick={registrationHandler}
						>
							{loading ? <Loading fill="white" /> : "Register"}
						</button>
						{checkError && (
							<div className="w-full flex justify-center items-center mb-6">
								<p className="text-red-500 font-noto">{error}</p>
							</div>
						)}
						{success.length > 0 && (
							<div className="w-full flex justify-center items-center">
								<p className="text-green-600 font-noto text-bold">{success}</p>
							</div>
						)}
					</form>
				</div>
				<div className="w-full border-t-2 border-t-[#D8DEE9] flex flex-col justify-center items-center mt-6 p-4">
					<label htmlFor="login" className="font-noto block">
						Already have an account?
					</label>
					<button
						id="login"
						className="w-full bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors flex justify-center items-center"
						onClick={() => {
							navigate("/");
						}}
					>
						Login
					</button>
				</div>
			</div>
		</div>
	);
};

export default Register;
