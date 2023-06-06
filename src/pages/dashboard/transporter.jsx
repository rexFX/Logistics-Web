import { useEffect, useState, useRef } from "react";
import { ReactComponent as Loading } from "../../assets/loading.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import localforage from "localforage";
import MessageBox from "./messageBox";

const Transporter = () => {
	const navigate = useNavigate();
	const [msgList, setMsgList] = useState([]);
	const [contactName, setContactName] = useState("");
	const [orderListFiltered, setOrderListFiltered] = useState(null);
	const [search, setSearch] = useState("");
	const [orderID, setOrderID] = useState("");
	const [role, setRole] = useState("");
	const [refresh, setRefresh] = useState(false);
	const [name, setName] = useState("");
	const [refreshing, setRefreshing] = useState(false);

	const orderList = useRef([]);
	const token = useRef("");
	const email = useRef("");
	const prevMsgListRef = useRef([]);
	const prevOrderIDRef = useRef("");

	const refreshToggle = () => {
		setRefreshing(true);
		setRefresh(!refresh);
	};

	const pushNormalMessage = (message, amount, isTherePayment) => {
		setMsgList((prevMsgList) => [
			...prevMsgList,
			{
				verification: email.current,
				orderID: orderID,
				writtenBy: "transporter",
				text: message,
				amount: amount,
				request: isTherePayment === true && amount > 0,
				paid: false,
			},
		]);
		axios.post(
			import.meta.env.VITE_BACKEND + `/api/postMessages/`,
			{
				verification: email.current,
				orderID: orderID,
				writtenBy: "transporter",
				text: message,
				amount: amount,
				request: isTherePayment === true && amount > 0,
				paid: false,
			},
			{
				headers: {
					authorization: `Bearer ${token.current}`,
				},
			}
		);
	};

	useEffect(() => {
		localforage.getItem("name").then((value) => {
			setName(value);
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
								orderList.current = res.data.message;
								setOrderListFiltered(orderList.current);
							})
							.catch((err) => {
								console.log(err);
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
				})
				.catch((err) => {
					console.log(err);
				});
		}
		setRefreshing(false);
	}, [refresh]);

	useEffect(() => {
		if (search.length > 0 && orderList.current.length > 0) {
			console.log(orderList.current);
			const filteredList = orderList.current.filter((order) => {
				return order.orderID.toLowerCase().includes(search.toLowerCase()) || order.to.toLowerCase().includes(search.toLowerCase()) || order.from.toLowerCase().includes(search.toLowerCase());
			});
			setOrderListFiltered(filteredList);
		} else if (search.length === 0) {
			setOrderListFiltered(orderList.current);
		}
	}, [search]);

	useEffect(() => {
		const interval = setInterval(async () => {
			if (prevOrderIDRef.current.length > 0) {
				await axios
					.get(import.meta.env.VITE_BACKEND + `/api/fetchMessages/`, {
						params: {
							orderID: prevOrderIDRef.current,
							verification: email.current,
						},
						headers: {
							authorization: `Bearer ${token.current}`,
						},
					})
					.then((res) => {
						if (res.data.success) {
							if (res.data.message.messages.length !== prevMsgListRef.current.length) {
								setMsgList(res.data.message.messages);
							}
						}
					})
					.catch((err) => {
						console.log(err);
					});
			}
		}, 10000);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		prevMsgListRef.current = msgList;
	}, [msgList]);

	useEffect(() => {
		prevOrderIDRef.current = orderID;
	}, [orderID]);

	const msgFetcher = (e) => {
		const value = JSON.parse(e.target.value);
		axios
			.get(import.meta.env.VITE_BACKEND + `/api/fetchMessages/`, {
				params: {
					orderID: value.orderID,
					verification: email.current,
				},
				headers: {
					authorization: `Bearer ${token.current}`,
				},
			})
			.then((res) => {
				if (res.data.success) {
					setOrderID(res.data.message.orderID);
					setMsgList(res.data.message.messages);
					setContactName(role === "manufacturer" ? res.data.message.transporterName : res.data.message.manufacturerName);
				} else {
					setMsgList([]);
					setContactName("No msg found");
					setOrderID("");
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const logoutHandler = () => {
		localforage.clear();
		navigate("/");
	};

	if (orderListFiltered === null) {
		return (
			<div className="h-screen w-screen bg-manufacturer bg-cover bg-center flex justify-center items-center">
				<Loading fill="white" className="scale-150" />
			</div>
		);
	}

	return (
		<div className="h-screen w-screen bg-manufacturer bg-cover bg-center flex flex-col md:flex-row justify-start overflow-y-auto">
			<div className="shadow-2xl shadow-right h-full w-full flex flex-col justify-center items-center bg-[#D8DEE9] md:w-[35%]">
				<div className="w-full flex justify-evenly items-center p-4">
					<span className="font-noto text-xl">Welcome {name.split(" ")[0]}!</span>
					<button className="w-24 mr-2 bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors" onClick={logoutHandler}>
						Logout
					</button>
				</div>
				<div className="p-4 h-full md:h-[80%] w-full flex flex-col justify-start items-center">
					<div className="w-full flex p-4 justify-center items-center">
						<h1 className="font-poppins font-bold text-2xl">Message History</h1>
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
								className="w-28 flex justify-center items-center bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors"
								onClick={refreshToggle}
							>
								{refreshing ? <Loading fill="white" /> : "Refresh"}
							</button>
						</div>
						<div className="flex-1 md:h-[90%] w-full mt-2 p-4 border-[1px] border-gray-500 rounded-xl shadow-lg flex flex-col justify-start bg-[#ECEFF4]">
							{orderListFiltered.length ? (
								orderListFiltered.map((order, index) => (
									<button
										key={order._id}
										className={`p-4 cursor-pointer text-left font-noto font-bold shadow-lg transition-colors text-black hover:bg-gray-200 rounded-lg m-1 ${
											index & 1 ? "bg-[#0fa3b1]" : "bg-[#3db7d3]"
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
									<p className="font-noto text-gray-500">No messages yet</p>
									<p className="font-noto text-gray-500 m-2">Click the button above to request transportation</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{contactName.length > 0 && <MessageBox contactName={contactName} msgList={msgList} role={role} sendMessageHelper={pushNormalMessage} />}
		</div>
	);
};

export default Transporter;

//add messaging feature
// add isuserlogged in at initialization
