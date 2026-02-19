import { GoogleMap, Polyline, OverlayView } from "@react-google-maps/api";
import { useMemo, Fragment, useCallback, useRef } from "react";
import { Bus, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
}

interface BusData {
  id: string;
  tripId: string;
  latitude: number;
  longitude: number;
  speed: number;
  busNumber: string;
  encodedPolyline?: string;
  routePoints?: RoutePoint[];
  [key: string]: any;
}

interface FleetMapProps {
  buses: BusData[];
  selectedBusId?: string | null;
  onBusClick?: (bus: BusData) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  interactive?: boolean;
  showStops?: boolean;
  showStartEnd?: boolean;
  className?: string;
}

const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 };

const INTERACTIVE_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
};

const NON_INTERACTIVE_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  scrollwheel: false,
  disableDoubleClickZoom: true,
  draggable: false,
  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
};

export function FleetMap({
  buses,
  selectedBusId,
  onBusClick,
  center,
  zoom = 13,
  interactive = true,
  showStops = false,
  showStartEnd = false,
  className,
}: FleetMapProps) {
  const mapOptions = interactive ? INTERACTIVE_OPTIONS : NON_INTERACTIVE_OPTIONS;
  const mapRef = useRef<google.maps.Map | null>(null);

  const decodePolyline = useCallback((encoded: string) => {
    if (!window.google?.maps?.geometry?.encoding) return [];
    try {
      return window.google.maps.geometry.encoding.decodePath(encoded).map((p) => ({ lat: p.lat(), lng: p.lng() }));
    } catch {
      return [];
    }
  }, []);

  const selectedBus = useMemo(
    () => buses.find((b) => b.tripId === selectedBusId || b.id === selectedBusId),
    [buses, selectedBusId],
  );

  const mapCenter = useMemo(() => {
    if (center) return center;
    if (selectedBus) return { lat: Number(selectedBus.latitude), lng: Number(selectedBus.longitude) };
    if (buses.length > 0) return { lat: Number(buses[0].latitude), lng: Number(buses[0].longitude) };
    return DEFAULT_CENTER;
  }, [center, selectedBus, buses]);

  const fitToRoute = useCallback(
    (map: google.maps.Map) => {
      const bounds = new window.google.maps.LatLngBounds();
      let hasPoints = false;

      buses.forEach((bus) => {
        let path: { lat: number; lng: number }[] = [];
        if (bus.encodedPolyline) path = decodePolyline(bus.encodedPolyline);
        if (path.length === 0 && bus.routePoints?.length)
          path = bus.routePoints.map((p) => ({ lat: Number(p.lat), lng: Number(p.lng) }));

        path.forEach((pt) => {
          bounds.extend(pt);
          hasPoints = true;
        });

        bounds.extend({ lat: Number(bus.latitude), lng: Number(bus.longitude) });
        hasPoints = true;
      });

      if (hasPoints) {
        map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
      }
    },
    [buses, decodePolyline],
  );

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      fitToRoute(map);
    },
    [fitToRoute],
  );

  return (
    <GoogleMap
      mapContainerClassName={cn("w-full h-full", className)}
      center={mapCenter}
      zoom={zoom}
      options={mapOptions}
      onLoad={onMapLoad}
    >
      {buses.map((bus) => {
        const isSelected = !!(selectedBusId && (bus.tripId === selectedBusId || bus.id === selectedBusId));

        let path: any[] = [];
        if (bus.encodedPolyline) path = decodePolyline(bus.encodedPolyline);
        if (path.length === 0 && bus.routePoints?.length)
          path = bus.routePoints.map((p) => ({ lat: Number(p.lat), lng: Number(p.lng) }));
        if (path.length < 2) return null;

        return (
          <Fragment key={`poly-${bus.tripId || bus.id}`}>
            <Polyline
              path={path}
              options={{
                strokeColor: "#1751bc",
                strokeOpacity: isSelected ? 0.2 : 0.08,
                strokeWeight: isSelected ? 12 : 9,
                geodesic: true,
                zIndex: 10,
              }}
            />
            <Polyline
              path={path}
              options={{
                strokeColor: "#1751bc",
                strokeOpacity: isSelected ? 1.0 : 0.55,
                strokeWeight: isSelected ? 4.5 : 3,
                geodesic: true,
                zIndex: 11,
              }}
            />
          </Fragment>
        );
      })}

      {(showStops || showStartEnd) &&
        selectedBus?.routePoints &&
        selectedBus.routePoints.map((p, idx) => {
          const total = selectedBus.routePoints!.length;
          const isFirst = idx === 0;
          const isLast = idx === total - 1;
          const isPrimary = isFirst || isLast;
          const dotColor = isPrimary ? "#1751bc" : "#f5be09";

          if (!showStops && !isPrimary) return null;

          return (
            <OverlayView
              key={`pt-${idx}`}
              position={{ lat: p.lat, lng: p.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                className="route-marker-container -translate-x-1/2 -translate-y-1/2"
                style={{ zIndex: isPrimary ? 30 : 20 }}
              >
                <div className="route-marker-pulse" style={{ background: dotColor }} />
                <div className="route-marker-dot" style={{ background: dotColor }} />
                <div
                  className={cn(
                    "marker-label",
                    isPrimary ? "marker-label-permanent" : "",
                    isFirst ? "marker-label-primary" : isLast ? "marker-label-destructive" : "",
                  )}
                >
                  {isPrimary ? (
                    <MapPin className="h-3 w-3 shrink-0" />
                  ) : (
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
                  )}
                  <span>
                    {isFirst && <span className="font-bold mr-0.5">START:</span>}
                    {isLast && <span className="font-bold mr-0.5">END:</span>}
                    {!isPrimary && <span className="text-muted-foreground font-medium mr-0.5">{idx}.</span>}
                    {p.name}
                  </span>
                </div>
              </div>
            </OverlayView>
          );
        })}

      {buses.map((bus) => (
        <Fragment key={`bus-${bus.tripId || bus.id}`}>
          <OverlayView
            position={{ lat: Number(bus.latitude), lng: Number(bus.longitude) }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              className={cn(
                "bus-marker-container -translate-x-1/2 -translate-y-1/2",
                interactive ? "cursor-pointer" : "pointer-events-none",
              )}
              onClick={() => interactive && onBusClick?.(bus)}
            >
              <div className="bus-marker-pulse" style={{ background: Number(bus.speed) > 0 ? "#1751bc" : "#ef4444" }} />
              <div
                className="bus-marker-icon-wrapper"
                style={{ borderColor: Number(bus.speed) > 0 ? "#1751bc" : "#ef4444" }}
              >
                <Bus className={cn("w-4 h-4", Number(bus.speed) > 0 ? "text-primary" : "text-destructive")} />
              </div>
            </div>
          </OverlayView>
        </Fragment>
      ))}
    </GoogleMap>
  );
}
