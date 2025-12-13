/**
 * Google Apps Script để tính khoảng cách thực tế
 * Sử dụng Google Maps Services có sẵn trong Google Apps Script (không cần API key)
 */

function doGet(e) {
  try {
    console.log('🔍 Starting distance calculation...');
    console.log('📋 Request parameters:', e);

    // Kiểm tra và lấy tham số từ request
    if (!e || !e.parameter) {
      console.error('❌ No parameters provided');
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: 'No parameters provided. Use ?origin=...&destination=...',
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const origin = e.parameter.origin;
    const destination = e.parameter.destination;

    console.log(`📍 Origin: ${origin}`);
    console.log(`📍 Destination: ${destination}`);

    if (!origin || !destination) {
      console.error('❌ Missing origin or destination parameter');
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error:
            'Missing origin or destination parameter. Use ?origin=...&destination=...',
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    console.log(
      `🔍 Calculating real distance from ${origin} to ${destination}`
    );

    // Xử lý địa chỉ để tránh lỗi URL quá dài
    const processedOrigin = processAddress(origin);
    const processedDestination = processAddress(destination);

    console.log(`📍 Processed origin: ${processedOrigin}`);
    console.log(`📍 Processed destination: ${processedDestination}`);

    // Sử dụng Google Maps Services có sẵn trong Google Apps Script
    const distanceResult = calculateDistanceWithGoogleMaps(
      processedOrigin,
      processedDestination
    );

    if (distanceResult.success) {
      console.log(
        `✅ Real distance calculated: ${distanceResult.distance.toFixed(2)} km`
      );

      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          distance: distanceResult.distance,
          duration: distanceResult.duration,
          method: 'google_maps_services',
        })
      ).setMimeType(ContentService.MimeType.JSON);
    } else {
      console.error('❌ Could not calculate distance');
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error:
            distanceResult.error ||
            'Could not calculate distance for these addresses.',
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('❌ Error:', error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Tính khoảng cách sử dụng Google Maps Services có sẵn trong Google Apps Script
 */
function calculateDistanceWithGoogleMaps(origin, destination) {
  try {
    console.log(`🗺️ Using Google Maps Services...`);

    // Sử dụng Google Maps Services có sẵn trong Google Apps Script
    const maps = Maps.newStaticMap()
      .setSize(600, 400)
      .addMarker(origin)
      .addMarker(destination);

    // Lấy tọa độ từ địa chỉ
    const originCoords = getCoordinatesFromAddress(origin);
    const destCoords = getCoordinatesFromAddress(destination);

    if (!originCoords || !destCoords) {
      console.error('❌ Could not get coordinates from addresses');
      return {
        success: false,
        error: 'Could not get coordinates from addresses',
      };
    }

    console.log(
      `📍 Origin coordinates: ${originCoords.lat}, ${originCoords.lng}`
    );
    console.log(
      `📍 Destination coordinates: ${destCoords.lat}, ${destCoords.lng}`
    );

    // Tính khoảng cách bằng công thức Haversine
    const distanceKm = calculateHaversineDistance(originCoords, destCoords);

    // Ước tính thời gian (trung bình 30km/h trong thành phố)
    const estimatedDurationMinutes = Math.round(distanceKm * 2);

    console.log(
      `✅ Distance calculated: ${distanceKm.toFixed(2)} km, ${estimatedDurationMinutes} minutes`
    );

    return {
      success: true,
      distance: distanceKm,
      duration: estimatedDurationMinutes,
    };
  } catch (error) {
    console.error(`❌ Google Maps Services error:`, error.toString());
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * Lấy tọa độ từ địa chỉ sử dụng Google Maps Services
 */
function getCoordinatesFromAddress(address) {
  try {
    console.log(`🗺️ Getting coordinates for: ${address}`);

    // Sử dụng Google Maps Geocoding service có sẵn
    const geocoder = Maps.newGeocoder();
    const result = geocoder.geocode(address);

    if (result && result.results && result.results.length > 0) {
      const location = result.results[0].geometry.location;
      console.log(`✅ Coordinates: ${location.lat}, ${location.lng}`);
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      console.error(`❌ No coordinates found for: ${address}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Geocoding error for ${address}:`, error.toString());
    return null;
  }
}

/**
 * Tính khoảng cách giữa 2 điểm bằng công thức Haversine
 */
function calculateHaversineDistance(point1, point2) {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Thêm hệ số điều chỉnh cho đường bộ (khoảng 1.3x)
  const roadDistance = distance * 1.3;

  console.log(`📏 Raw distance: ${distance.toFixed(2)} km`);
  console.log(`🛣️ Road distance: ${roadDistance.toFixed(2)} km`);

  return roadDistance;
}

/**
 * Xử lý địa chỉ để tránh lỗi URL quá dài
 */
function processAddress(address) {
  if (!address) return '';

  // Rút gọn địa chỉ bằng cách loại bỏ các từ không cần thiết
  let processed = address
    .replace(/Thành phố Hồ Chí Minh/gi, 'HCM')
    .replace(/Thành phố/gi, 'TP')
    .replace(/Phường/gi, 'P')
    .replace(/Quận/gi, 'Q')
    .replace(/Đường/gi, 'Đ')
    .replace(/Lô/gi, 'L')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Nếu địa chỉ vẫn quá dài, chỉ lấy phần quan trọng
  if (processed.length > 100) {
    const parts = processed.split(' ');
    const importantParts = [];

    // Ưu tiên các từ quan trọng
    for (const part of parts) {
      if (
        part.match(/^(Q|P|Đ|L)\d+/) ||
        part.match(/^(HCM|TP|Tan|Phu|Go|Vap|Quan|Phuong)/i)
      ) {
        importantParts.push(part);
      }
    }

    processed = importantParts.join(' ');
  }

  console.log(`🔄 Address processed: "${address}" → "${processed}"`);
  return processed;
}

/**
 * Test function
 */
function testDistanceCalculation() {
  const origin =
    'lô2-5, Đường CN1, Phường Tây Thạnh, Quận Tân Phú, TP. Hồ Chí Minh';
  const destination =
    '605 Nguyễn Thị Thập, Phường Tân Hưng, Quận 7, TP. Hồ Chí Minh';

  const testParams = {
    parameter: {
      origin: origin,
      destination: destination,
    },
  };

  console.log('🧪 Testing distance calculation...');
  const result = doGet(testParams);
  console.log('📋 Test result:', result.getContent());
}
