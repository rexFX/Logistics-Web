import { useEffect, useState, useRef } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { ReactComponent as Loading } from "../../assets/loading.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import localforage from "localforage";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId();

const Manufacturer = () => {
	const navigate = useNavigate();
	const [sendMessage, setSendMessage] = useState("");
	const [requestForm, setRequestForm] = useState(false);
	const [selectedQuantity, setSelectedQuantity] = useState("");
	const [selectedTransporter, setSelectedTransporter] = useState("");
	const [selectedTransporterEmail, setSelectedTransporterEmail] =
		useState("");
	const [dropdown, setDropdown] = useState(false);
	const [transporterDropdown, setTransporterDropdown] = useState(false);
	const [transporterList, setTransporterList] = useState([]);
	const [msgList, setMsgList] = useState([]);
	const [contactName, setContactName] = useState("");
	const [orderListFiltered, setOrderListFiltered] = useState(null);
	const [search, setSearch] = useState("");
	const [sendLoading, setSendLoading] = useState(false);
	const [address, setAddress] = useState("");
	const [orderID, setOrderID] = useState(null);
	const [error, setError] = useState(false);
	const [errorText, setErrorText] = useState("");
	const [role, setRole] = useState("");
	const [requestTo, setRequestTo] = useState("");
	const [requestFrom, setRequestFrom] = useState("");
	const [refresh, setRefresh] = useState(false);
	const orderList = useRef([]);
	const token = useRef("");
	const email = useRef("");

	const cancelRequest = () => {
		setRequestForm(false);
		setSendLoading(false);
		setError(false);
		setErrorText("");
		setOrderID(null);
		setSelectedQuantity("");
		setSelectedTransporter("");
		setSelectedTransporterEmail("");
		setRequestFrom("");
		setRequestTo("");
	};

	const initiateRequest = () => {
		setOrderID(uid());
		setRequestForm(true);
	};

	const pushOrderMessage = (e) => {
		setSendLoading(true);
		setError(false);
		e.preventDefault();

		axios
			.post(
				import.meta.env.VITE_BACKEND + `/api/postOrderMessages/`,
				{
					verification: email.current,
					orderID: orderID,
					from: requestFrom,
					to: requestTo,
					quantity: selectedQuantity,
					manufacturer: email.current,
					transporter: selectedTransporterEmail,
					address: address,
				},
				{
					headers: {
						authorization: `Bearer ${token.current}`,
					},
				}
			)
			.then(() => {
				setRefresh(!refresh);
				setSendLoading(false);
				setRequestForm(false);
				setOrderID(null);
				setSelectedQuantity("");
				setSelectedTransporter("");
				setSelectedTransporterEmail("");
				setAddress("");
				setRequestTo("");
				setRequestFrom("");
				setDropdown(false);
				setTransporterDropdown(false);
			})
			.catch((err) => {
				setErrorText(err.response.data.message.message);
				setSendLoading(false);
				setError(true);
			});
	};

	useEffect(() => {
		localforage.getItem("address").then((value) => {
			setAddress(value);
		});

		localforage.getItem("role").then((value) => setRole(value));

		localforage
			.getItem("token")
			.then((value) => {
				token.current = value;
			})
			.then(() => {
				localforage
					.getItem("email")
					.then((value) => {
						email.current = value;
					})
					.then(() => {
						axios
							.get(
								import.meta.env.VITE_BACKEND +
									`/api/fetchOrderList/`,
								{
									params: {
										verification: `${email.current}`,
										from: `${email.current}`,
									},
									headers: {
										authorization: `Bearer ${token.current}`,
									},
								}
							)
							.then((res) => {
								orderList.current = res.data.message;
								setOrderListFiltered(orderList.current);
							});

						axios
							.get(
								import.meta.env.VITE_BACKEND +
									`/api/fetchTransportersList/`,
								{
									params: {
										from: `${email.current}`,
										verification: `${email.current}`,
									},
									headers: {
										authorization: `Bearer ${token.current}`,
									},
								}
							)
							.then((res) => {
								setTransporterList(res.data.message);
							});
					});
			});
	}, []);

	useEffect(() => {
		if (email.current.length && token.current.length) {
			axios
				.get(import.meta.env.VITE_BACKEND + `/api/fetchOrderList/`, {
					params: {
						verification: `${email.current}`,
						from: `${email.current}`,
					},
					headers: {
						authorization: `Bearer ${token.current}`,
					},
				})
				.then((res) => {
					if (res.data.message.length !== orderList.current.length) {
						orderList.current = res.data.message;
						setOrderListFiltered(orderList.current);
					}
				});
		}
	}, [refresh]);

	useEffect(() => {
		if (search.length && orderList.current.length) {
			const filteredList = orderList.current.message.filter((order) => {
				return (
					order.orderID
						.toLowerCase()
						.includes(search.toLowerCase()) ||
					order.To.toLowerCase().includes(search.toLowerCase()) ||
					order.From.toLowerCase().includes(search.toLowerCase())
				);
			});
			setOrderListFiltered(filteredList);
		}
	}, [search]);

	const msgFetcher = (e) => {
		const value = JSON.parse(e.target.value);
		axios
			.get(import.meta.env.VITE_BACKEND + `/api/fetchMessages/`, {
				params: {
					from: value.From,
					to: value.To,
					orderID: value.orderID,
					verification: email.current,
				},
				headers: {
					authorization: `Bearer ${token.current}`,
				},
			})
			.then((res) => {
				setMsgList(res.data.message[0].messages);
				setContactName(
					role === "manufacturer"
						? res.data.message[0].transporter
						: res.data.message[0].manufacturer
				);
			});
	};

	const logoutHandler = () => {
		localforage.clear();
		navigate("/");
	};

	if (orderListFiltered === null) return null;

	return (
		<div className="h-screen w-screen bg-manufacturer bg-cover bg-center flex flex-col md:flex-row justify-start overflow-y-auto">
			<div className="shadow-2xl shadow-right h-full w-full flex flex-col justify-center items-center bg-[#D8DEE9] md:w-[35%]">
				<div className="w-full flex justify-evenly items-center p-4">
					<button
						className="w-24 mr-2 bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors"
						onClick={logoutHandler}
					>
						Logout
					</button>
					<button
						className="w-52 bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors"
						onClick={initiateRequest}
					>
						Request Transportation
					</button>
				</div>
				<div className="p-4 h-full md:h-[80%] w-full flex flex-col justify-start items-center">
					<div className="w-full flex p-4 justify-center items-center">
						<h1 className="font-poppins font-bold text-2xl">
							Message History
						</h1>
					</div>
					<div className="w-full flex-1 overflow-y-auto flex flex-col justify-center items-center">
						<div className="flex justify-evenly items-center w-full">
							<input
								type="text"
								className="p-3
									w-[80%]
									block
									rounded-lg
									border-[1px]
									border-gray-500
									mr-2
									shadow-sm
									outline-0
									font-noto
									focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
								value={search}
								placeholder="Search"
								onChange={(e) => {
									setSearch(e.target.value);
								}}
							/>
							<button
								className="w-28 bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors"
								onClick={() => {
									setRefresh(!refresh);
								}}
							>
								Refresh
							</button>
						</div>
						<div className="flex-1 md:h-[90%] w-full mt-2 p-4 border-[1px] border-gray-500 rounded-xl shadow-lg flex flex-col justify-start bg-[#ECEFF4]">
							{orderListFiltered.length ? (
								orderListFiltered.map((order, index) => (
									<button
										key={order._id}
										className={`p-4 cursor-pointer text-left font-noto text-black hover:bg-gray-200 rounded-lg m-1 ${
											index & 1
												? "bg-[#8FBCBB]"
												: "bg-[#88C0D0]"
										}`}
										value={JSON.stringify({
											orderID: order.orderID,
											To: order.to,
											From: order.from,
										})}
										onClick={msgFetcher}
									>
										{`Order ID: ${order.orderID} | To: ${order.to} | From: ${order.from}`}
									</button>
								))
							) : (
								<div className="h-full flex flex-col justify-center items-center">
									<p className="font-noto text-gray-500">
										No messages yet
									</p>
									<p className="font-noto text-gray-500 m-2">
										Click the button above to request
										transportation
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{contactName.length && !requestForm && (
				<div className="flex-1 md:m-16 bg-[#D8DEE9] md:rounded-lg shadow-lg border-[1px] p-14">
					<div className="h-full w-full flex flex-col items-center">
						<h1 className="w-full font-noto text-2xl text-left">
							{contactName}
						</h1>
						<div className="mt-8 w-full bg-[#ECEFF4] flex-1 rounded-lg border-[1px] border-gray-500 overflow-y-auto">
							{msgList.length > 0 && (
								<div className="h-full w-full p-4">
									{msgList.map((msg) => (
										<div
											key={msg.id}
											className={`p-5 w-full flex justify-${
												msg.writtenBy !== role
													? "start"
													: "end"
											} items-center hover:bg-gray-200`}
										>
											<p
												className={`p-6 font-noto text-black ${
													msg.writtenBy !== role
														? "rounded-tr-xl bg-[#8FBCBB]"
														: "rounded-tl-xl bg-[#88C0D0]"
												} rounded-b-xl flex flex-col items-start justify-evenly`}
											>
												{msg.text}
												{msg.request && (
													<button className="bg-[#5E81AC] p-3 shadow-xl rounded-lg mt-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors">
														Pay Rs. {msg.amount}
													</button>
												)}
											</p>
										</div>
									))}
								</div>
							)}
						</div>
						<div className="w-full flex m-2">
							<input
								className="p-3
								block
								flex-1
								rounded-md
								mr-2
								border-[1px]
								border-gray-500
								shadow-sm
								outline-0
								font-noto
								focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
								placeholder="Type your message here"
								value={sendMessage}
								onChange={(e) => setSendMessage(e.target.value)}
							/>
							<button className="bg-[#5E81AC] p-3 shadow-xl rounded-lg font-ubuntu text-white hover:bg-[#81A1C1] transition-colors">
								Send
							</button>
						</div>
					</div>
				</div>
			)}
			{requestForm && orderID !== null && (
				<div className="flex-1 md:m-28 bg-[#D8DEE9] md:rounded-lg shadow-lg border-[1px] p-14">
					<div className="h-full w-full flex flex-col items-center justify-center">
						<div className="w-full flex p-3 justify-evenly items-center">
							<h1 className="w-full font-noto text-2xl text-left">
								Request Transportation
							</h1>
							<button
								className="w-28 bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors"
								onClick={cancelRequest}
							>
								Go Back
							</button>
						</div>
						<div className="mt-2 w-full flex-1 flex justify-center items-center">
							<form className="w-full flex flex-col justify-center items-center">
								<label className="font-noto text-left w-[80%]">
									Order ID
								</label>
								<input
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
								<label className="font-noto text-left w-[80%] mt-3">
									To
								</label>
								<input
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
									placeholder="To"
									value={requestTo}
									onChange={(e) =>
										setRequestTo(e.target.value)
									}
								/>
								<label className="font-noto text-left w-[80%] mt-3">
									From
								</label>
								<input
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
									placeholder="From"
									value={requestFrom}
									onChange={(e) =>
										setRequestFrom(e.target.value)
									}
								/>
								<label className="font-noto text-left w-[80%] mt-3">
									Address
								</label>
								<input
									type="text"
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
									placeholder="Address"
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
											{selectedQuantity === "" ? (
												<span className="text-gray-400 mr-4">
													Select Quantity
												</span>
											) : (
												<span>{selectedQuantity}</span>
											)}

											{dropdown ? (
												<FiChevronUp />
											) : (
												<FiChevronDown />
											)}
										</button>
										{dropdown && (
											<div className="w-48 flex flex-col justify-center items-center absolute top-11 rounded-b-lg bg-white">
												<h3
													className="font-noto w-full hover:bg-gray-200 p-3 text-center cursor-pointer"
													onClick={(e) => {
														e.preventDefault();
														setSelectedQuantity(
															"1 Ton"
														);
														setDropdown(false);
													}}
												>
													1 Ton
												</h3>
												<h3
													className="font-noto w-full hover:bg-gray-200 p-3 text-center rounded-b-lg cursor-pointer"
													onClick={(e) => {
														e.preventDefault();
														setSelectedQuantity(
															"2 Ton"
														);
														setDropdown(false);
													}}
												>
													2 Ton
												</h3>
												<h3
													className="font-noto w-full hover:bg-gray-200 p-3 text-center rounded-b-lg cursor-pointer"
													onClick={(e) => {
														e.preventDefault();
														setSelectedQuantity(
															"3 Ton"
														);
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
												setTransporterDropdown(
													!transporterDropdown
												);
											}}
										>
											{selectedTransporter === "" ? (
												<span className="text-gray-400 mr-4">
													Select Transporter
												</span>
											) : (
												<span>
													{selectedTransporter}
												</span>
											)}

											{transporterDropdown ? (
												<FiChevronUp />
											) : (
												<FiChevronDown />
											)}
										</button>
										{transporterDropdown && (
											<div className="w-full overflow-y-auto absolute top-11">
												<div className="w-full flex flex-col justify-center items-center rounded-b-lg bg-white max-h-36">
													{transporterList.length &&
														transporterList.map(
															(transporter) => (
																<h3
																	key={
																		transporter._id
																	}
																	className="font-noto hover:bg-gray-200 w-full p-3 text-center cursor-pointer"
																	onClick={(
																		e
																	) => {
																		e.preventDefault();
																		setSelectedTransporter(
																			transporter.name
																		);
																		setSelectedTransporterEmail(
																			transporter.email
																		);
																		setTransporterDropdown(
																			false
																		);
																	}}
																>
																	{
																		transporter.name
																	}
																</h3>
															)
														)}
												</div>
											</div>
										)}
									</div>
								</div>
								<button
									className="flex justify-center items-center w-48 bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors"
									onClick={pushOrderMessage}
								>
									{sendLoading ? (
										<Loading fill="white" />
									) : (
										"Send Request"
									)}
								</button>
								{error && (
									<p className="text-red-500 font-noto">
										{errorText}
									</p>
								)}
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Manufacturer;

//add messaging feature
