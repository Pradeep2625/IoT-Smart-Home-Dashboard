# Smart Home Dashboard - API Integration Guide

## Backend Integration Setup

To connect this frontend with your .NET backend, follow these steps:

### 1. Update SignalR Hub URL

In `src/services/signalRService.ts`, replace the placeholder URL:

```typescript
await signalRService.startConnection('https://your-actual-backend-url/smartHomeHub');
```

### 2. Backend SignalR Hub Requirements

Your .NET backend should have a SignalR hub that sends these events:

```csharp
// Send sensor data updates
await Clients.All.SendAsync("SensorDataUpdated", new { 
    temperature = 22.5, 
    humidity = 45 
});

// Send security status changes
await Clients.All.SendAsync("SecurityStatusChanged", true);

// Send device state changes
await Clients.All.SendAsync("DeviceStateChanged", "lights", new { state = true });

// Send historical data
await Clients.All.SendAsync("TemperatureHistoryUpdated", temperatureData);
await Clients.All.SendAsync("PowerUsageUpdated", powerData);
```

### 3. Hub Methods for Device Control

Your hub should handle these incoming methods:

```csharp
public async Task ToggleLight(string deviceId)
{
    // Your device control logic
    await Clients.All.SendAsync("DeviceStateChanged", "lights", newState);
}

public async Task UpdateThermostat(string deviceId, int temperature)
{
    // Your thermostat control logic
    await Clients.All.SendAsync("DeviceStateChanged", "thermostat", new { temperature });
}

public async Task ToggleDoorLock(string deviceId)
{
    // Your door lock control logic
    await Clients.All.SendAsync("DeviceStateChanged", "door", newState);
}
```

### 4. CORS Configuration

Ensure your backend allows CORS for your frontend domain:

```csharp
app.UseCors(builder =>
    builder.WithOrigins("http://localhost:8080", "https://your-frontend-domain.com")
           .AllowAnyMethod()
           .AllowAnyHeader()
           .AllowCredentials());
```

### 5. Authentication (Optional)

If you need authentication, update the SignalR connection:

```typescript
this.connection = new HubConnectionBuilder()
    .withUrl(hubUrl, {
        accessTokenFactory: () => getAuthToken()
    })
    .withAutomaticReconnect()
    .build();
```

### 6. API Endpoints Structure

Based on your API requirements document, ensure these endpoints are available:

#### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`

#### Device Management
- `GET /api/devices`
- `POST /api/devices`
- `PUT /api/devices/{id}`
- `DELETE /api/devices/{id}`

#### Sensor Data
- `GET /api/sensors/temperature`
- `GET /api/sensors/security`

#### Automation Controls
- `POST /api/control/light/{id}`
- `POST /api/control/thermostat/{id}`
- `POST /api/control/door/{id}`
- `POST /api/control/security/{id}`

### 7. Environment Configuration

Create a `.env.local` file for your backend URL:

```
VITE_BACKEND_URL=https://your-backend-url.com
VITE_SIGNALR_HUB=/smartHomeHub
```

Then update the service to use environment variables:

```typescript
const hubUrl = `${import.meta.env.VITE_BACKEND_URL}${import.meta.env.VITE_SIGNALR_HUB}`;
```

## Data Format Examples

### Sensor Data Format
```json
{
  "temperature": 22.5,
  "humidity": 45,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Testing the Integration

1. Start your .NET backend
2. Update the SignalR URL in the frontend
3. Run the frontend with `npm run dev`
4. Check browser console for connection status
5. Test device controls to verify two-way communication

The dashboard will show connection status in the header, and all controls should trigger real-time updates when properly connected to your backend.