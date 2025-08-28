using System.Threading.Tasks;
using backend.Models;
public interface ISensorService
{
    Task<SensorData> GetLatestSensorData(int deviceId);
    Task SaveSensorReading(SensorReading reading);
    Task TriggerAlert(Alert alert);
}

// Ensure this is a separate class definition
public class SensorData
{
    public double Temperature { get; set; }
    public int Humidity { get; set; }
    public int PowerUsage { get; set; }
    public string? SecurityAlert { get; set; }
}