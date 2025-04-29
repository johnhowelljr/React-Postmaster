import React, { useState, useEffect } from 'react'; // Import useEffect
import {
	TextField, Button, Select, MenuItem, FormControl, InputLabel,
	Grid, Typography, Box, Paper, IconButton, List, ListItem, ListItemText, Divider
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import axios from 'axios';

function App() {
	// Load initial state from localStorage or use defaults
	const [method, setMethod] = useState(() => localStorage.getItem('react-postmaster-method') || 'GET');
	const [url, setUrl] = useState(() => localStorage.getItem('react-postmaster-url') || 'https://httpbin.org/get');
	const [headers, setHeaders] = useState(() => {
		const savedHeaders = localStorage.getItem('react-postmaster-headers');
		try {
			return savedHeaders ? JSON.parse(savedHeaders) : [{ key: '', value: '' }];
		} catch (e) {
			console.error("Failed to parse saved headers:", e);
			return [{ key: '', value: '' }];
		}
	});
	const [body, setBody] = useState(() => localStorage.getItem('react-postmaster-body') || '');
	const [response, setResponse] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [requestTime, setRequestTime] = useState(null); // State for request duration

	const handleHeaderChange = (index, field, value) => {
		const newHeaders = [...headers];
		newHeaders[index][field] = value;
		setHeaders(newHeaders);
	};

	const addHeader = () => {
		setHeaders([...headers, { key: '', value: '' }]);
	};

	const removeHeader = (index) => {
		const newHeaders = headers.filter((_, i) => i !== index);
		setHeaders(newHeaders);
	};

	const handleSendRequest = async () => {
		setLoading(true);
		setError(null);
		setResponse(null);
		setRequestTime(null); // Reset time
		const startTime = performance.now(); // Record start time

		const requestHeaders = headers.reduce((acc, header) => {
			if (header.key) {
				acc[header.key] = header.value;
			}
			return acc;
		}, {});

		let endTime;
		try {
			const config = {
				method: method,
				url: url,
				headers: requestHeaders,
				data: method === 'POST' ? body : undefined,
			};
			const res = await axios(config);
			endTime = performance.now(); // Record end time on success
			setRequestTime(Math.round(endTime - startTime)); // Calculate and set duration
			setResponse({
				status: res.status,
				statusText: res.statusText,
				headers: res.headers,
				data: res.data,
			});
		} catch (err) {
			endTime = performance.now(); // Record end time on error too
			setRequestTime(Math.round(endTime - startTime)); // Calculate and set duration
			if (err.response) {
				// Still set response data even on HTTP error status
				setResponse({
					status: err.response.status,
					statusText: err.response.statusText,
					headers: err.response.headers,
					data: err.response.data,
				});
			} else if (err.request) {
				setError('Network Error: No response received from server.');
			} else {
				setError(`Error: ${err.message}`);
			}
		} finally {
			setLoading(false);
		}
	};

	// --- LocalStorage Effects ---
	useEffect(() => {
		localStorage.setItem('react-postmaster-method', method);
	}, [method]);

	useEffect(() => {
		localStorage.setItem('react-postmaster-url', url);
	}, [url]);

	useEffect(() => {
		localStorage.setItem('react-postmaster-headers', JSON.stringify(headers));
	}, [headers]);

	useEffect(() => {
		localStorage.setItem('react-postmaster-body', body);
	}, [body]);
	// --- End LocalStorage Effects ---


	// Styles for consistent font size
	const inputStyle = { sx: { fontSize: '12px' } };
	const labelStyle = { sx: { fontSize: '12px' } };
	const menuItemStyle = { fontSize: '12px' };
	const typographyStyle = { fontSize: '12px' };

	return (
		// Main container using Flexbox to fill viewport height
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>

			{/* Top Section (Request Config) - Fixed Height */}
			{/* Remove padding from parent Box, apply individually */}
			<Box sx={{ flexShrink: 0 }}>
				{/* Add padding to title */}
				<Typography variant="h6" gutterBottom sx={{ p: 2, pb: 0, fontSize: '16px' }}>React Postmaster</Typography>
				{/* Apply padding to the Box containing the Grid */}
				<Box sx={{ p: 2, pt: 1 }}>
					<Grid container spacing={1} alignItems="center" wrap="nowrap"> {/* Prevent wrapping */}
						{/* Set Method to auto width */}
						<Grid item xs="auto">
							<FormControl size="small" sx={{ minWidth: 120 }}> {/* Ensure minimum width */}
								<InputLabel id="method-select-label" {...labelStyle}>Method</InputLabel>
								<Select
									labelId="method-select-label"
									value={method}
									label="Method"
									onChange={(e) => setMethod(e.target.value)}
									sx={menuItemStyle}
								>
									<MenuItem value={'GET'} sx={menuItemStyle}>GET</MenuItem>
									<MenuItem value={'POST'} sx={menuItemStyle}>POST</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						{/* Set URL field to take 50% of viewport width */}
						<Grid item sx={{ width: '50vw', flexGrow: 1, pl: 1, pr: 1 }}> {/* Explicit width, allow grow, add padding */}
							<TextField
								fullWidth // Fill the grid item
								size="small"
								label="URL"
								variant="outlined"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								InputLabelProps={labelStyle}
								InputProps={inputStyle}
							/>
						</Grid>
						{/* Set Button to auto width */}
						<Grid item xs="auto">
							<Button
								size="medium"
								variant="contained"
								color="primary"
								onClick={handleSendRequest}
								disabled={loading || !url}
								sx={{ fontSize: '12px', textTransform: 'none' }}
							>
								{loading ? 'Sending...' : 'Send'}
							</Button>
						</Grid>
					</Grid>
				</Box>

				{/* Add padding to the Paper */}
				<Box sx={{ pl: 2, pr: 2, pb: 2 }}> {/* Add padding around Paper */}
					<Paper elevation={3} sx={{ p: 2 }}>
						<Box>
							<Typography variant="subtitle1" sx={{ mb: 1, ...typographyStyle }}>Headers</Typography>
							{headers.map((header, index) => (
								<Grid container spacing={1} key={index} sx={{ mb: 1 }} alignItems="center">
									<Grid item xs={5}>
										<TextField
											fullWidth
											size="small"
											label="Key"
											value={header.key}
											onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
											InputLabelProps={labelStyle}
											InputProps={inputStyle}
										/>
									</Grid>
									<Grid item xs={5}>
										<TextField
											fullWidth
											size="small"
											label="Value"
											value={header.value}
											onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
											InputLabelProps={labelStyle}
											InputProps={inputStyle}
										/>
									</Grid>
									<Grid item xs={2}>
										{/* Keep remove button here */}
										<IconButton onClick={() => removeHeader(index)} size="small" disabled={headers.length === 1 && index === 0 && !header.key && !header.value}>
											<RemoveCircleOutlineIcon fontSize="small" />
										</IconButton>
										{/* Remove add button from here */}
									</Grid>
								</Grid>
							))}
							{/* Add button container after the map */}
							<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
								<Button
									size="small"
									startIcon={<AddCircleOutlineIcon />}
									onClick={addHeader}
									sx={{ fontSize: '12px', textTransform: 'none' }}
								>
									Add Header
								</Button>
							</Box>
						</Box>

						{method === 'POST' && (
							<Box sx={{ mt: 2 }}>
								<Typography variant="subtitle1" sx={{ mb: 1, ...typographyStyle }}>Body (JSON)</Typography>
								<TextField
									fullWidth
									size="small"
									multiline
									rows={4} // Keep rows for initial size, but it can grow
									variant="outlined"
									value={body}
									onChange={(e) => setBody(e.target.value)}
									placeholder='{ "key": "value" }'
									InputLabelProps={labelStyle}
									InputProps={inputStyle}
								/>
							</Box>
						)}
					</Paper>
				</Box>
			</Box>

			{/* Bottom Section (Response/Error) - Expandable and Scrollable - Ensure padding */}
			<Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
				{error && (
					<Paper elevation={3} sx={{ p: 2, bgcolor: 'error.dark', color: 'error.contrastText', height: '100%', display: 'flex', flexDirection: 'column' }}>
						<Typography variant="subtitle1" sx={typographyStyle}>Error</Typography>
						<Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', mt: 1, flexGrow: 1, overflow: 'auto', ...typographyStyle }}>{error}</Typography>
					</Paper>
				)}

				{response && (
					// Make response paper fill height and allow internal scrolling
					<Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
						<Typography variant="subtitle1" sx={typographyStyle}>Response</Typography>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
							<Typography variant="body2" gutterBottom sx={{ ...typographyStyle, mb: 0 }}> {/* Remove bottom margin */}
								Status: <Box component="span" sx={{ color: response.status >= 200 && response.status < 300 ? 'success.light' : 'error.light', fontWeight: 'bold' }}>
									{response.status} {response.statusText}
								</Box>
							</Typography>
							{requestTime !== null && (
								<Typography variant="body2" sx={{ ...typographyStyle, color: 'text.secondary' }}>
									Time: {requestTime} ms
								</Typography>
							)}
						</Box>
						<Divider sx={{ my: 1 }} />
						<Typography variant="subtitle2" sx={typographyStyle}>Headers</Typography>
						{/* Allow List to take available space, remove fixed maxHeight */}
						<List dense sx={{ overflow: 'auto', bgcolor: 'background.paper', p: 1, borderRadius: 1, mt: 0.5, flexShrink: 1, minHeight: '50px' }}>
							{Object.entries(response.headers).map(([key, value]) => (
								<ListItem key={key} disablePadding sx={{ py: 0.2 }}>
									<ListItemText primary={`${key}: ${value}`} primaryTypographyProps={{ sx: { wordBreak: 'break-all', ...typographyStyle } }} />
								</ListItem>
							))}
						</List>
						<Divider sx={{ my: 1 }} />
						<Typography variant="subtitle2" sx={typographyStyle}>Body</Typography>
						{/* Allow Body Box to take available space, remove fixed maxHeight */}
						<Box component="pre" sx={{ overflow: 'auto', bgcolor: 'background.paper', p: 1.5, borderRadius: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all', mt: 0.5, flexGrow: 1, ...typographyStyle }}>
							{typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : String(response.data)}
						</Box>
					</Paper>
				)}
			</Box>
		</Box>
	);
}

export default App;
