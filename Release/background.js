
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 2. A page requested user data, respond with a copy of `user`
  if (message.MsgID=="ChangeBadge") {
	  chrome.action.setBadgeText({ text: message.MsgText });
	  sendResponse(true);
  }
  if (message.MsgID=="ChangeBadgeColor") {
	   chrome.action.setBadgeBackgroundColor({ color: message.MsgText });
	  sendResponse(true);
  }
});