import { useEffect, useState } from "react";
import { getToken, onMessage, MessagePayload } from "firebase/messaging";
import { getMessagingInstance } from "@/lib/firebase";
import { toast } from "sonner";
import { apiClient } from "@/api/api-client";

export function useFcm() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupFcm = async () => {
      try {
        const messaging = await getMessagingInstance();
        if (!messaging) {
          console.warn("Firebase Messaging is not supported in this environment.");
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          });
          if (token) {
            setFcmToken(token);
            localStorage.setItem("fcm_token", token);
            // Register token with backend
            await apiClient.post("/notifications/devices/register", {
              fcmToken: token,
              deviceType: "WEB_DASHBOARD",
            });
          }
        }

        // Listen for foreground messages
        unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
          // 1. Show in-app toast
          toast(payload.notification?.title || "New Message", {
            description: payload.notification?.body,
          });

          // 2. Show browser system notification if permission is granted
          if (payload.notification && Notification.permission === "granted") {
            new Notification(payload.notification.title || "New Message", {
              body: payload.notification.body,
              icon: "/logo-icon.png",
            });
          }

          // Dispatch custom event to trigger notification refresh
          window.dispatchEvent(new CustomEvent("fcm-message-received"));
        });
      } catch (error) {
        console.error("FCM Setup Error:", error);
      }
    };

    setupFcm();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { fcmToken };
}
