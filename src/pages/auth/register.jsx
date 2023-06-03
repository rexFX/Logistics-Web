import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

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
	const [selectedOption, setSelectedOption] = useState("");

	const registrationHandler = (event) => {
		event.preventDefault();

		if (/^\d+$/.test(pincode) === false) {
			setError("Pincode should be a number");
			setCheckError(true);
			return;
		}

		if (pincode.length !== 6) {
			setError("Pincode should be 6 digits");
			setCheckError(true);
			return;
		}

		if (
			countryCode[0] !== "+" ||
			/^\d+$/.test(countryCode.slice(1)) === false
		) {
			setError("Country code should be a number starting with +");
			setCheckError(true);
			return;
		}

		if (/^\d+$/.test(phoneNumber) === false) {
			setError("Phone number should be a number");
			setCheckError(true);
			return;
		}

		if (phoneNumber.length !== 10) {
			setError("Phone number should be 10 digits");
			setCheckError(true);
			return;
		}

		if (selectedOption === "") {
			setError("Please tell us who you are");
			setCheckError(true);
			return;
		}

		setError("");
		setCheckError(false);
		console.log("registered");
	};

	return (
		<div className="shadow-2xl shadow-left h-full w-full flex flex-col justify-center items-center bg-[#ECEFF4] bg-opacity-[75%] md:w-[45%] lg:w-[35%]">
			<div className="p-4 h-full w-80 flex flex-col justify-center items-center">
				<h1 className="font-poppins font-bold text-4xl">
					Create Account
				</h1>
				<div className="mt-2 w-full">
					<form className="h-full flex flex-col justify-center items-center mt-5">
						<input
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
								{selectedOption === "" ? (
									<span className="text-gray-400">
										What should we call you?
									</span>
								) : (
									<span>{selectedOption}</span>
								)}

								{dropdown ? <FiChevronUp /> : <FiChevronDown />}
							</button>
							{dropdown && (
								<div className="w-full flex flex-col justify-center items-center absolute top-11 rounded-b-lg bg-white">
									<h3
										className="font-noto hover:bg-gray-200 w-full p-3 text-center cursor-pointer"
										onClick={(e) => {
											e.preventDefault();
											setSelectedOption("Transporter");
											setDropdown(false);
										}}
									>
										Transporter
									</h3>
									<h3
										className="font-noto hover:bg-gray-200 w-full p-3 text-center rounded-b-lg cursor-pointer"
										onClick={(e) => {
											e.preventDefault();
											setSelectedOption("Manufacturer");
											setDropdown(false);
										}}
									>
										Manufacturer
									</h3>
								</div>
							)}
						</div>
						<button
							className="w-[80%] bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors"
							onClick={registrationHandler}
						>
							Register
						</button>
					</form>
					{checkError && (
						<div className="w-full flex justify-center items-center">
							<p className="text-red-500 font-noto">{error}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Register;
