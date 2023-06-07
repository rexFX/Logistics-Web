import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 5 });

const MessageBox = ({ contactName, msgList, role, sendMessageHelper, title }) => {
	const [sendMessage, setSendMessage] = useState("");
	const [paymentButton, setPaymentButton] = useState(false);
	const [amount, setAmount] = useState(0);
	const messageContainerRef = useRef(null);

	const paymentButtonHandler = () => {
		setPaymentButton(!paymentButton);
		setAmount(0);
	};

	const messageSender = () => {
		sendMessageHelper(sendMessage, amount, paymentButton);
		setSendMessage("");
		setAmount(0);
	};

	useEffect(() => {
		messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
	}, [msgList]);

	if (!msgList) return null;

	return (
		<div className="flex-1 md:m-16 bg-[#D8DEE9] md:rounded-lg shadow-lg border-[1px] p-14">
			<div className="h-full w-full flex flex-col items-center">
				<div className="w-full flex justify-evenly items-center">
					<h1 className="text-2xl mr-1 font-poppins ">{contactName}</h1>
					<h1 className="text-lg font-noto">{title}</h1>
				</div>
				<div ref={messageContainerRef} className="mt-8 w-full bg-[#ECEFF4] flex-1 rounded-lg border-[1px] border-gray-500 overflow-y-auto">
					{msgList.length > 0 && (
						<div className="h-full w-full p-4">
							{msgList.map((msg) => (
								<div key={msg.id ?? uid()} className={`p-5 w-full flex justify-${msg.writtenBy !== role ? "start" : "end"} items-center hover:bg-gray-200`}>
									<p
										className={`p-6 font-noto font-bold text-black ${
											msg.writtenBy !== role ? "rounded-tr-xl bg-[#88C0D0]" : "rounded-tl-xl bg-[#8FBCBB]"
										} rounded-b-xl flex flex-col items-start justify-evenly break-words`}
									>
										{msg.text}
										{msg.request === true && (
											<button className="bg-[#5E81AC] p-3 shadow-xl rounded-lg mt-3 font-ubuntu text-white hover:bg-[#81A1C1] transition-colors">Pay Rs. {msg.amount}</button>
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
								? "p-3 w-28 rounded-md ml-2 border-[1px] border-gray-500 shadow-sm outline-0 font-noto focus:border-indigo-400 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
								: "w-0"
						} transition-all`}
					/>
					<button className="bg-[#5E81AC] p-3 mx-2 shadow-xl rounded-lg font-ubuntu text-white hover:bg-[#81A1C1] transition-colors" onClick={paymentButtonHandler}>
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
	title: PropTypes.string.isRequired,
};

export default MessageBox;
