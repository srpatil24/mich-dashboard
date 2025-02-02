import React, { useContext } from "react";
import { Button, StyleSheet, TextInput, Modal } from "react-native";
import { WebView } from "react-native-webview";
import { Text, View } from "@/components/Themed";
import * as Creds from "@/api/creds";
import { useEffect, useState } from "react";
import { setCanvasApiToken } from "@/api/globalSettings";
import { EventContext } from "@/app/(tabs)/EventContext";


export default function SettingsScreen() {
	const [canvasToken, setCanvasToken] = useState("");
	const [msuLoggedIn, setMsuLoggedIn] = useState(false);
	const [showWebView, setShowWebView] = useState(false);
	const { setEventsText } = useContext(EventContext);
	
	useEffect(() => {
		Creds.getValueFor("canvas.access-token").then((token) => {
			if (token){ 
				setCanvasToken(token);
				setCanvasApiToken(token);
		}
		});
		Creds.getValueFor("msu.logged-in").then((status) => {
			if (status === "true") setMsuLoggedIn(true);
		});	  
	}, []);

	useEffect(() => {
		Creds.save("canvas.access-token", canvasToken);
		setCanvasApiToken(canvasToken);
	}, [canvasToken]);

	useEffect(() => {
		Creds.save("msu.logged-in", "false");
	}, []);
	

	function updateToken() {
		Creds.save("canvas.access-token", canvasToken);
		console.log("setting canvas api token to", canvasToken);
		setCanvasApiToken(canvasToken);
	}

	interface WebViewNavigationEvent {
		url: string;
	}
	interface WebViewMessageEvent {
		nativeEvent: {
			data: string;
		};
	}

	const handleWebViewNavigation = (event: WebViewNavigationEvent) => {
		const { url } = event;
		console.log("Navigating to:", url);
		// For debugging/demo, do not close the WebView automatically.
		// Uncomment the following lines to enable auto-closing after login:
		// if (url.includes("/d2l/home")) {
		//   setMsuLoggedIn(true);
		//   setShowWebView(false);
		// }
	};


	const handleWebViewMessage = ({ nativeEvent: { data } }: WebViewMessageEvent) => {
		console.log("Message from WebView:", data);
		if (data === "CLOSE_WEBVIEW") {
			// Close the WebView by updating state
			setShowWebView(false);
		}		
		else if (data.startsWith("Element Text:")) {
		  const cleanedText = data
			.replace("Element Text:", "")
			.trim()
			.split("\n")
			.map(line => line.trim())
			.filter(line => line)
			.join("\n");
		  setShowWebView(false); 
		  setEventsText(cleanedText);
		}
	  };
	  
	const automationScript = `
		(async function() {
		// Guard to prevent multiple executions.
		if (window.__automationScriptHasRun) {
			window.ReactNativeWebView.postMessage("Automation script already executed.");
			return;
		}
		window.__automationScriptHasRun = true;
		
		window.ReactNativeWebView.postMessage("Automation script started");
		
		// ========= Helper Functions =========
		async function waitForElement(selector) {
			while (document.querySelector(selector) === null) {
			await new Promise(resolve => requestAnimationFrame(resolve));
			}
			window.ReactNativeWebView.postMessage("Found element: " + selector);
			return document.querySelector(selector);
		}
		
		async function waitForShadowElement(parent, selector) {
			while (parent.shadowRoot === null || parent.shadowRoot.querySelector(selector) === null) {
			await new Promise(resolve => requestAnimationFrame(resolve));
			}
			return parent.shadowRoot.querySelector(selector);
		}
		
		async function waitForChildElement(parent, selector) {
			while (parent.querySelector(selector) === null) {
			await new Promise(resolve => requestAnimationFrame(resolve));
			}
			return parent.querySelector(selector);
		}
		
		async function waitForAnyShadowElement(parent, selectors, timeout = 30000) {
			let startTime = Date.now();
			while (Date.now() - startTime < timeout) {
			for (let selector of selectors) {
				if (parent.shadowRoot && parent.shadowRoot.querySelector(selector)) {
				return parent.shadowRoot.querySelector(selector);
				}
			}
			await new Promise(resolve => setTimeout(resolve, 100));
			}
			return null;
		}
		
		// ========= Part 1: Compute the Calendar URL and Redirect =========
		if (!window.location.href.includes("/d2l/le/calendar/")) {
			try {
			let element = await waitForElement('.d2l-body.d2l-typography.vui-typography.d2l-tiles-container.daylight .d2l-page-main.d2l-max-width.d2l-min-width .d2l-page-main-padding .d2l-homepage .homepage-container .homepage-row .homepage-col-8 .d2l-widget.d2l-tile[role="region"]');
			element = element.querySelector('d2l-expand-collapse-content');
			element = element.querySelector('div.d2l-widget-content-padding d2l-my-courses');
			window.ReactNativeWebView.postMessage("Courses container found");
			element = await waitForShadowElement(element, 'd2l-my-courses-container');
			element = await waitForShadowElement(element, 'd2l-tabs d2l-tab-panel');
			element = element.querySelector('d2l-my-courses-content');
			element = await waitForShadowElement(element, 'd2l-my-courses-card-grid');
			const selectors = [
				'div.course-card-grid.columns-2 d2l-enrollment-card:not([disabled]):not([closed])',
				'div.course-card-grid.columns-1 d2l-enrollment-card:not([disabled]):not([closed])',
				'div.course-card-grid.columns-3 d2l-enrollment-card:not([disabled]):not([closed])'
			];
			element = await waitForAnyShadowElement(element, selectors);
			element = await waitForShadowElement(element, 'd2l-card');
			element = await waitForShadowElement(element, '.d2l-card-container');
			element = await waitForChildElement(element, 'a[href]');
			let href = element.getAttribute('href');
			window.ReactNativeWebView.postMessage("Extracted href: " + href);
			let regex = /\\/d2l\\/home\\/(\\d+)/;
			let match = href.match(regex);
			let numbers = match ? match[1] : null;
			let finalLink = "https://d2l.msu.edu/d2l/le/calendar/";
			if (numbers) {
				finalLink += numbers;
			}
			window.ReactNativeWebView.postMessage("Computed calendar URL: " + finalLink);
			// For demonstration, we do not immediately redirect. 
			// Uncomment the next line to redirect automatically:
			window.location.href = finalLink;
			return;
			} catch (error) {
			window.ReactNativeWebView.postMessage("Error computing calendar URL: " + error);
			return;
			}
		}
		
		// ========= Part 2: Automate Print Workflow on Calendar Page =========
		if (window.location.href.includes("/d2l/le/calendar/")) {
			window.ReactNativeWebView.postMessage("On Calendar Page, starting print workflow...");

			try {
				await waitForElement('.d2l-body');

				// Step 1: Locate the print button with shadow DOM
				let printButtonHost = await waitForElement('d2l-button-subtle[icon="tier1:print"]');
				window.ReactNativeWebView.postMessage("Located print button host.");

				let printButton = await waitForShadowElement(printButtonHost, 'button.d2l-button-subtle-has-icon');
				window.ReactNativeWebView.postMessage("Found print button inside shadow root.");

				// Step 2: Click the print button
				printButton.click();
				window.ReactNativeWebView.postMessage("Clicked first print button.");

				// Step 3: Wait for the dialog iframe to load
				let dialogIframe = await waitForElement('iframe.d2l-dialog-frame');
				if (!dialogIframe) {
					window.ReactNativeWebView.postMessage("Dialog iframe did not appear after first print button click.");
					return;
				}
				window.ReactNativeWebView.postMessage("Dialog iframe loaded.");

				// Ensure the iframe content is fully loaded
				await new Promise((resolve) => {
					const checkIframeLoaded = () => {
						const iframeDocument = dialogIframe.contentDocument || dialogIframe.contentWindow.document;
						if (iframeDocument && iframeDocument.readyState === 'complete') {
							resolve();
						} else {
							setTimeout(checkIframeLoaded, 100); // Check every 100ms
						}
					};
					checkIframeLoaded();
				});

				window.ReactNativeWebView.postMessage("Iframe content fully loaded.");

				// Delay execution to ensure elements load properly
				setTimeout(() => {
					window.ReactNativeWebView.postMessage("Timeout for 5s completed, starting element selection.");

					// Step 1: Select the outer iframe
					const outerFrame = document.evaluate(
						"//iframe[@title='Print']", 
						document, 
						null, 
						XPathResult.FIRST_ORDERED_NODE_TYPE, 
						null
					).singleNodeValue;

					if (outerFrame) {
						window.ReactNativeWebView.postMessage("Outer iframe found.");
						const outerDoc = outerFrame.contentDocument || outerFrame.contentWindow.document;
						
						// Step 2: Select inner iframe without using dynamic ID
						const innerFrame = outerDoc.querySelector("iframe[id^='d2l_']");
						
						if (innerFrame) {
							window.ReactNativeWebView.postMessage("Inner iframe found.");
							const innerDoc = innerFrame.contentDocument || innerFrame.contentWindow.document;

							// Step 3: Find the target div
							const targetElement = innerDoc.querySelector("div.d2l-page-print-shim");

							if (targetElement) {
								window.ReactNativeWebView.postMessage("Target element found.");

								// Step 4: Select the next element
								const nextElement = targetElement.nextElementSibling;
								if (nextElement) {
									const elementText = nextElement.textContent.trim();
									const elementHTML = nextElement.outerHTML;

									window.ReactNativeWebView.postMessage("Element Text:" + elementText);
									// Optionally send the full HTML if needed:
									// window.ReactNativeWebView.postMessage("Element HTML: " + elementHTML);
								} else {
									window.ReactNativeWebView.postMessage("No element found immediately after the target.");
								}
							} else {
								window.ReactNativeWebView.postMessage("Target element not found.");
							}
						} else {
							window.ReactNativeWebView.postMessage("Inner iframe not found.");
						}
					} else {
						window.ReactNativeWebView.postMessage("Outer iframe not found.");
					}
				}, 3500);  // Wait 3.5 seconds before executing

			} catch (error) {
				window.ReactNativeWebView.postMessage("Error during print workflow: " + error);
			}

		}

		})();
		true;
	`;


	return (
		<View style={styles.container}>
			<Text>Enter your your canvas api token</Text>
			<TextInput
				style={styles.input}
				value={canvasToken}
				onChangeText={setCanvasToken}
				keyboardType="visible-password"
				placeholder="Canvas access token"
				placeholderTextColor="white"
			/>
			<Button title="Set Token" color="red" onPress={updateToken}/>
			<View style={styles.separator} />

			{/* MSU Login Section */}
			<Text style={styles.title}>MSU Login (D2L)</Text>
			<Button
			title="Login with MSU"
			color="green"
			onPress={() => setShowWebView(true)}
			/>
			{msuLoggedIn ? (
			<Text style={styles.tokenText}>MSU Login Successful!</Text>
			) : (
			<Text style={styles.tokenText}>Not logged in to MSU</Text>
			)}

			{/* MSU Login WebView Modal */}
			<Modal visible={showWebView} animationType="slide">
			<WebView
				source={{ uri: "https://d2l.msu.edu" }}  // MSU D2L login URL (or starting URL)
				javaScriptEnabled={true}
				domStorageEnabled={true}
				injectedJavaScript={automationScript}
				onMessage={handleWebViewMessage}
				onNavigationStateChange={handleWebViewNavigation}
				startInLoadingState={true}
			/>

			<Button
				title="Close"
				color="red"
				onPress={() => setShowWebView(false)}
			/>
			</Modal>

		
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "80%",
		marginTop: 20,
		marginHorizontal: "auto"
	},
	input: {
		height: 40,
		margin: 12,
		borderWidth: 1,
		padding: 10,
		color: "white",
		backgroundColor: "#1b1b1b"
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
	},
	separator: {
		marginVertical: 30,
		height: 1,
		width: "80%",
	},
	tokenText: {
		textAlign: "center",
		marginTop: 10,
		fontSize: 14,
		color: "#999",
	},
	extractedTitle: {
		marginTop: 20,
		fontSize: 18,
		fontWeight: "bold",
		textAlign: "center",
	},
	extractedContent: {
		marginTop: 10,
		fontSize: 14,
		color: "#444",
		paddingHorizontal: 10,
	},
});
