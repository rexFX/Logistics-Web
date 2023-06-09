import { useState } from "react";
import axios from "axios";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { ReactComponent as Loading } from "../../assets/loading.svg";
import PropTypes from "prop-types";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 10 });

const RequestForm = ({ socket, requestFormToggle, transporterList, refreshToggle, name, givenAddress, token, email }) => {
	const [selectedQuantity, setSelectedQuantity] = useState("");
	const [selectedTransporter, setSelectedTransporter] = useState("");
	const [selectedTransporterEmail, setSelectedTransporterEmail] = useState("");
	const [dropdown, setDropdown] = useState(false);
	const [transporterDropdown, setTransporterDropdown] = useState(false);
	const [sendLoading, setSendLoading] = useState(false);
	const [address, setAddress] = useState(givenAddress);
	const [error, setError] = useState(false);
	const [errorText, setErrorText] = useState("");
	const [requestDest, setRequestDest] = useState("");
	const [requestSource, setRequestSource] = useState("");
	const [orderID, setOrderID] = useState(uid().toUpperCase());

	const cancelRequest = () => {
		requestFormToggle(false);
		setSendLoading(false);
		setError(false);
		setErrorText("");
		setOrderID(null);
		setSelectedQuantity("");
		setSelectedTransporter("");
		setSelectedTransporterEmail("");
		setRequestSource("");
		setRequestDest("");
	};

	const pushOrderMessage = (e) => {
		setSendLoading(true);
		setError(false);
		e.preventDefault();

		const id = uid();

		const payload = {
			from: requestSource,
			to: requestDest,
			orderID: orderID,
			address: address,
			quantity: selectedQuantity,
			transporterName: selectedTransporter,
			manufacturerName: name,
			transporter: selectedTransporterEmail,
			manufacturer: email,
		};

		const text = [
			{
				id: id,
				text: `Order Request (OrderID: ${orderID}): I have to deliver ${selectedQuantity} units of goods to ${requestDest}. Pickup is ${requestSource}. Please let me know if you are interested in delivering this order.`,
				from: requestSource,
				to: requestDest,
				writtenBy: "manufacturer",
				request: false,
				amount: 0,
				paid: false,
			},
		];

		axios
			.post(
				import.meta.env.VITE_BACKEND + `/api/postOrderMessages/`,
				{
					id: id,
					verification: email,
					...payload,
				},
				{
					headers: {
						authorization: `Bearer ${token}`,
					},
				}
			)
			.then(() => {
				socket.emit("send_order", {
					msg: {
						...payload,
						messages: text,
					},
					receiver: selectedTransporterEmail,
				});
				refreshToggle();
				setSendLoading(false);
				requestFormToggle(false);
				setSelectedQuantity("");
				setSelectedTransporter("");
				setSelectedTransporterEmail("");
				setAddress("");
				setRequestDest("");
				setRequestSource("");
				setDropdown(false);
				setTransporterDropdown(false);
			})
			.catch((err) => {
				setErrorText(err.response.data.message.message);
				setSendLoading(false);
				setError(true);
			});
	};

	return (
		<div className="flex-1 md:m-28 bg-[#D8DEE9] bg-opacity-[90%] md:rounded-lg shadow-lg border-[1px] p-14">
			<div className="h-full w-full flex flex-col items-center justify-center">
				<div className="w-full flex p-3 justify-evenly items-center">
					<h1 className="w-full font-noto text-2xl text-left">Request Transportation</h1>
					<button className="w-28 bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors" onClick={cancelRequest}>
						Go Back
					</button>
				</div>
				<div className="mt-2 w-full flex-1 flex justify-center items-center">
					<form className="w-full flex flex-col justify-center items-center">
						<label htmlFor="orderID" className="font-noto text-left w-[80%]">
							Order ID
						</label>
						<input
							name="orderID"
							id="orderID"
							type="text"
							className="p-3
									w-[80%]
									block
									flex-1
									rounded-md
									border-[1px]
									border-gray-500
									shadow-sm
									outline-0
									font-noto
									focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
							placeholder="Order ID"
							value={orderID}
							disabled
						/>
						<label htmlFor="requestDest" className="font-noto text-left w-[80%] mt-3">
							To
						</label>
						<input
							name="requestDest"
							id="requestDest"
							type="text"
							className="p-3
									w-[80%]
									block
									flex-1
									rounded-md
									border-[1px]
									border-gray-500
									shadow-sm
									outline-0
									font-noto
									focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
							placeholder="Destination"
							value={requestDest}
							onChange={(e) => setRequestDest(e.target.value)}
						/>
						<label htmlFor="requestSource" className="font-noto text-left w-[80%] mt-3">
							From
						</label>
						<input
							type="text"
							name="requestSource"
							id="requestSource"
							className="p-3
									w-[80%]
									block
									flex-1
									rounded-md
									border-[1px]
									border-gray-500
									shadow-sm
									outline-0
									font-noto
									focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
							placeholder="Source"
							value={requestSource}
							onChange={(e) => setRequestSource(e.target.value)}
						/>
						<label htmlFor="address" className="font-noto text-left w-[80%] mt-3">
							Manufacturer Address
						</label>
						<input
							type="text"
							name="address"
							id="address"
							className="p-3
									w-[80%]
									block
									flex-1
									rounded-md
									border-[1px]
									border-gray-500
									shadow-sm
									m-2
									outline-0
									font-noto
									focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
							placeholder="Your Address"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
						/>
						<div className="w-[80%] flex justify-evenly items-center">
							<div className="w-48 mr-2 flex flex-col justify-between items-center relative">
								<button
									className="p-3
											w-48
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
									{selectedQuantity === "" ? <span className="text-gray-400 mr-4">Select Quantity</span> : <span>{selectedQuantity}</span>}

									{dropdown ? <FiChevronUp /> : <FiChevronDown />}
								</button>
								{dropdown && (
									<div className="w-48 flex flex-col justify-center items-center absolute top-11 rounded-b-lg bg-white">
										<h3
											className="font-noto w-full hover:bg-gray-200 p-3 text-center cursor-pointer"
											onClick={(e) => {
												e.preventDefault();
												setSelectedQuantity("1 Ton");
												setDropdown(false);
											}}
										>
											1 Ton
										</h3>
										<h3
											className="font-noto w-full hover:bg-gray-200 p-3 text-center rounded-b-lg cursor-pointer"
											onClick={(e) => {
												e.preventDefault();
												setSelectedQuantity("2 Ton");
												setDropdown(false);
											}}
										>
											2 Ton
										</h3>
										<h3
											className="font-noto w-full hover:bg-gray-200 p-3 text-center rounded-b-lg cursor-pointer"
											onClick={(e) => {
												e.preventDefault();
												setSelectedQuantity("3 Ton");
												setDropdown(false);
											}}
										>
											3 Ton
										</h3>
									</div>
								)}
							</div>
							<div className="flex-1 flex flex-col justify-between items-center relative">
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
										setTransporterDropdown(!transporterDropdown);
									}}
								>
									{selectedTransporter === "" ? <span className="text-gray-400 mr-4">Select Transporter</span> : <span>{selectedTransporter}</span>}

									{transporterDropdown ? <FiChevronUp /> : <FiChevronDown />}
								</button>
								{transporterDropdown && (
									<div className="w-full overflow-y-auto absolute top-11">
										<div className="w-full flex flex-col justify-center items-center rounded-b-lg bg-white max-h-36">
											{transporterList.length > 0 &&
												transporterList.map((transporter) => (
													<h3
														key={transporter._id}
														className="font-noto hover:bg-gray-200 w-full p-3 text-center cursor-pointer"
														onClick={(e) => {
															e.preventDefault();
															setSelectedTransporter(transporter.name);
															setSelectedTransporterEmail(transporter.email);
															setTransporterDropdown(false);
														}}
													>
														{transporter.name}
													</h3>
												))}
										</div>
									</div>
								)}
							</div>
						</div>
						<button
							className="flex justify-center items-center w-48 bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors"
							onClick={pushOrderMessage}
						>
							{sendLoading ? <Loading fill="white" /> : "Send Request"}
						</button>
						{error && <p className="text-red-500 font-noto">{errorText}</p>}
					</form>
				</div>
			</div>
		</div>
	);
};

RequestForm.propTypes = {
	requestFormToggle: PropTypes.func.isRequired,
	transporterList: PropTypes.array.isRequired,
	refreshToggle: PropTypes.func.isRequired,
	name: PropTypes.string.isRequired,
	givenAddress: PropTypes.string.isRequired,
	token: PropTypes.string.isRequired,
	email: PropTypes.string.isRequired,
	socket: PropTypes.object.isRequired,
};

export default RequestForm;
