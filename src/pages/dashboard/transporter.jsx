import { useEffect, useState, useRef } from "react";
import { ReactComponent as Loading } from "../../assets/loading.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import localforage from "localforage";
import MessageBox from "./messageBox";
import ShortUniqueId from "short-unique-id";
import io from "socket.io-client";

let socket;
const Transporter = () => {
	const uid = new ShortUniqueId({ length: 10 });
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
	const [msgBoxTitleName, setMsgBoxTitleName] = useState({});
	const [searchButton, setSearchButton] = useState(false);

	const orderList = useRef([]);
	const token = useRef("");
	const email = useRef("");
	const prevMsgListRef = useRef([]);
	const prevOrderIDRef = useRef("");

	const refreshToggle = () => {
		setRefreshing(true);
		setRefresh(!refresh);
	};

	const searchButtonToggle = () => {
		setSearchButton(!searchButton);
	};

	const pushNormalMessage = (scrollToBottom, message, amount, isTherePayment) => {
		const payload = {
			id: uid(),
			writtenBy: role,
			text: message,
			amount: amount,
			request: isTherePayment === true && amount > 0,
			paid: false,
		};

		prevMsgListRef.current.push(payload);
		setMsgList(prevMsgListRef.current);

		axios
			.post(
				import.meta.env.VITE_BACKEND + `/api/postMessages/`,
				{
					verification: email.current,
					orderID: orderID,
					...payload,
				},
				{
					headers: {
						authorization: `Bearer ${token.current}`,
					},
				}
			)
			.then(() => {
				socket.emit("send_message", {
					payload: payload,
					orderID: orderID,
				});
				scrollToBottom();
			});
	};

	const paymentHandler = (textID, orderID) => {
		axios
			.post(
				import.meta.env.VITE_BACKEND + `/api/pay`,
				{
					textID: textID,
					orderID: orderID,
					verification: email.current,
				},
				{
					headers: {
						authorization: `Bearer ${token.current}`,
					},
				}
			)
			.then(() => {
				socket.emit("send_payment", {
					orderID: orderID,
					textID: textID,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	useEffect(() => {
		socket = io(import.meta.env.VITE_BACKEND);
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
						socket.emit("receive_order", value);
						socket.on(value, function (message) {
							if (!orderList.current.includes(message.orderID)) {
								orderList.current.push(message);
								searchButtonToggle();
							}
						});
					})
					.then(() => {
						axios
							.get(import.meta.env.VITE_BACKEND + `/api/fetchOrderList/`, {
								params: {
									email: `${email.current}`,
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

		return () => {
			socket.removeAllListeners();
			socket.disconnect();
		};
	}, []);

	useEffect(() => {
		msgFetcher(JSON.stringify(msgBoxTitleName));
		if (email.current.length && token.current.length) {
			axios
				.get(import.meta.env.VITE_BACKEND + `/api/fetchOrderList/`, {
					params: {
						email: `${email.current}`,
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
			const filteredList = orderList.current.filter((order) => {
				return order.orderID.toLowerCase().includes(search.toLowerCase()) || order.to.toLowerCase().includes(search.toLowerCase()) || order.from.toLowerCase().includes(search.toLowerCase());
			});
			setOrderListFiltered(filteredList);
		} else if (search.length === 0) {
			setOrderListFiltered(orderList.current);
		}
	}, [search, searchButton]);

	useEffect(() => {
		prevOrderIDRef.current = orderID;
	}, [orderID]);

	useEffect(() => {
		const order = prevOrderIDRef.current;
		if (order.length > 0) {
			socket.emit("join", order);
			socket.on(order, function (message) {
				if (message.isPayment) {
					const { textID } = message;

					setMsgList(
						prevMsgListRef.current.map((msg) => {
							if (msg.id === textID) {
								return {
									...msg,
									paid: true,
								};
							}
							return msg;
						})
					);
				} else {
					const { id, writtenBy, text, amount, request, paid } = message.payload;
					setMsgList((prevMsgList) => [...prevMsgList, { id, writtenBy, text, amount, request, paid }]);
				}
			});
		}
		return () => {
			if (order.length > 0) {
				socket.emit("leave", order);
				socket.removeAllListeners(order);
			}
		};
	}, [orderID]);

	useEffect(() => {
		prevMsgListRef.current = msgList;
	}, [msgList]);

	const msgFetcher = (val) => {
		if (val === "{}") return;
		const value = JSON.parse(val);
		setMsgBoxTitleName(value);
		axios
			.get(import.meta.env.VITE_BACKEND + `/api/fetchMessages/`, {
				params: {
					orderID: value.orderID,
					email: email.current,
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
		<div className="h-screen w-screen bg-transporter bg-cover bg-center flex flex-col md:flex-row justify-start overflow-y-auto">
			<div className="shadow-2xl shadow-right h-full w-full flex flex-col justify-center items-center bg-[#D8DEE9] bg-opacity-[85%] md:w-[40%] lg:w-[35%]">
				<div className="w-full flex justify-evenly items-center p-4">
					<span className="font-noto text-xl">Welcome {name.split(" ")[0]}!</span>
					<button className="w-24 mr-2 bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors" onClick={logoutHandler}>
						Logout
					</button>
				</div>
				<div className="p-4 h-full md:h-[75%] w-full flex flex-col justify-start items-center">
					<div className="w-full flex p-4 justify-center items-center">
						<h1 className="font-poppins font-bold text-2xl">Message History</h1>
					</div>
					<div className="h-full w-full flex-1 flex flex-col justify-center items-center">
						<div className="flex justify-evenly items-center w-full">
							<input
								type="text"
								name="search"
								id="search"
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
								placeholder="Enter a text to search"
								onChange={(e) => {
									setSearch(e.target.value);
								}}
							/>
							<button
								className="w-28 mx-2 flex justify-center items-center bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors"
								onClick={searchButtonToggle}
							>
								Search
							</button>
							<button
								className="w-28 flex justify-center items-center bg-[#5E81AC] p-3 shadow-xl rounded-lg my-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors"
								onClick={refreshToggle}
							>
								{refreshing ? <Loading fill="white" /> : "Refresh"}
							</button>
						</div>
						<div className="mb-4 h-[80%] w-full mt-2 p-4 overflow-y-auto  border-[1px] border-gray-500 rounded-xl shadow-lg bg-[#ECEFF4]">
							<div className="full w-full flex flex-col justify-start">
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
											onClick={(e) => msgFetcher(e.target.value)}
										>
											{`Order ID: ${order.orderID} | From: ${order.from} | To: ${order.to}`}
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
			</div>

			{contactName.length > 0 && (
				<MessageBox paymentHandler={paymentHandler} contactName={contactName} msgList={msgList} role={role} sendMessageHelper={pushNormalMessage} title={msgBoxTitleName} />
			)}
		</div>
	);
};

export default Transporter;

//add messaging feature
// add isuserlogged in at initialization
