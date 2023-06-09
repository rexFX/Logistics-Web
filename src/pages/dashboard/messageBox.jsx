import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FaCheck } from "react-icons/fa";

const MessageBox = ({ contactName, msgList, role, sendMessageHelper, title, paymentHandler }) => {
	const [sendMessage, setSendMessage] = useState("");
	const [paymentButton, setPaymentButton] = useState(false);
	const [amount, setAmount] = useState(0);
	const messageContainerRef = useRef(null);

	const paymentButtonHandler = () => {
		setPaymentButton(!paymentButton);
		setAmount(0);
	};

	const messageSender = () => {
		if (sendMessage === "") return;
		sendMessageHelper(scrollToBottom, sendMessage, amount, paymentButton);
		setSendMessage("");
		setAmount(0);
	};

	const scrollToBottom = () => {
		messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
	};

	useEffect(() => {
		scrollToBottom();
	}, [msgList]);

	if (!msgList) return null;

	return (
		<div className="flex-1 md:m-16 bg-[#D8DEE9] bg-opacity-[90%] md:rounded-lg shadow-lg border-[1px] p-14">
			<div className="h-full w-full flex flex-col items-center">
				<div className="w-full flex justify-evenly items-center">
					<h1 className="text-2xl mr-1 font-poppins ">{contactName}</h1>
					<h1 className="text-lg font-noto">
						Order ID: {title.orderID} | From: {title.From} | To: {title.To}
					</h1>
				</div>
				<div ref={messageContainerRef} className="mt-8 w-full bg-[#ECEFF4] flex-1 max-h-60 md:max-h-none rounded-lg border-[1px] border-gray-500 overflow-y-auto">
					{msgList.length > 0 && (
						<div className="h-full w-full p-4">
							{msgList.map((msg) => (
								<div key={msg.id} className={`p-5 w-full flex justify-${msg.writtenBy !== role ? "start" : "end"} items-center hover:bg-gray-200`}>
									<p
										className={`p-6 font-noto font-bold text-black ${
											msg.writtenBy !== role ? "rounded-tr-xl bg-[#88C0D0]" : "rounded-tl-xl bg-[#8FBCBB]"
										} rounded-b-xl flex flex-col items-start justify-evenly break-words`}
									>
										{msg.text}
										<button
											value={msg.id}
											className={`${msg.request === true ? "" : "hidden"} rounded-lg flex items-center justify-evenly w-40 ${
												role === msg.writtenBy || msg.paid ? "cursor-not-allowed" : "shadow-xl font-ubuntu text-white hover:bg-[#81A1C1] transition-colors"
											} p-3 mt-3 bg-[#5E81AC]`}
											onClick={(e) => {
												paymentHandler(e.target.value, title.orderID);
											}}
											disabled={role === msg.writtenBy || msg.paid}
										>
											{msg.paid ? <FaCheck /> : "Pay"} Rs. {msg.amount}
										</button>
									</p>
								</div>
							))}
						</div>
					)}
				</div>
				<div className="w-full flex m-2 flex-col md:flex-row">
					<input
						type="text"
						name="textMessage"
						id="textMessage"
						className="p-3
								flex-1
								rounded-md
								border-[1px]
								border-gray-500
								shadow-sm
								outline-0
								font-noto
								focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
						placeholder="Type your message here"
						value={sendMessage}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								messageSender();
							}
						}}
						onChange={(e) => setSendMessage(e.target.value)}
					/>
					<input
						type="number"
						step="0.01"
						name="amount"
						id="amount"
						placeholder="Amount"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								messageSender();
							}
						}}
						className={`${
							paymentButton
								? "p-3 mt-2 md:mt-0 w-28 rounded-md ml-2 border-[1px] border-gray-500 shadow-sm outline-0 font-noto focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
								: "w-0"
						} transition-all`}
					/>
					<button className="bg-[#5E81AC] p-3 my-2 md:mx-2 md:my-0 shadow-xl rounded-lg font-ubuntu text-white hover:bg-[#81A1C1] transition-colors" onClick={paymentButtonHandler}>
						Request Payment
					</button>
					<button className="bg-[#5E81AC] p-3 shadow-xl rounded-lg font-ubuntu text-white hover:bg-[#81A1C1] transition-colors" onClick={messageSender}>
						Send
					</button>
				</div>
			</div>
		</div>
	);
};

MessageBox.propTypes = {
	contactName: PropTypes.string.isRequired,
	msgList: PropTypes.array,
	role: PropTypes.string.isRequired,
	sendMessageHelper: PropTypes.func.isRequired,
	title: PropTypes.object.isRequired,
	paymentHandler: PropTypes.func.isRequired,
};

export default MessageBox;
