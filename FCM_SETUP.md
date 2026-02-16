# FCM (Push Notifications) Setup

## 1. Firebase Console

1. [Firebase Console](https://console.firebase.google.com/) open karo.
2. Existing project select karo ya **Add project** se naya banao.
3. **Project Settings** (gear) → **General** → **Your apps**.
4. Agar Android app pehle se add nahi hai:
   - **Add app** → **Android**.
   - **Package name** daalo: `com.routeiq` (same as `android/app/build.gradle` → `applicationId`).
   - **Register app** → **Download google-services.json**.
5. `google-services.json` ko yahan copy karo:  
   `android/app/google-services.json`

## 2. Backend (FCM token save)

App FCM token is endpoint par **POST** karega (Settings me Push ON karne par):

- **URL:** `POST {API_BASE_URL}/notifications/fcm-token`
- **Headers:** `Authorization: Bearer <user_token>`, `Content-Type: application/json`
- **Body:** `{ "fcmToken": "<device_fcm_token>", "platform": "android" }`

Backend ko ye token store karna hoga (user/device ke sath) taake baad me Firebase Admin SDK se is device ko push bhej sako.

Agar tumhara endpoint alag hai (e.g. `/users/me/fcm-token`), to `src/services/fcmService.ts` me `getFcmTokenEndpoint()` ko apne hisaab se change karo.

## 3. Install & run

```bash
npm install
npx react-native run-android
```

Pehli baar run se pehle **google-services.json** `android/app/` me hona zaroori hai, warna build/import error aa sakta hai.

## 4. Test push

- Settings → **Push Notification** ON karo (permission allow karo).
- Backend me check karo ke FCM token save ho gaya.
- Firebase Console → **Engage** → **Cloud Messaging** se test message bhej sakte ho (FCM token use karke), ya backend se Firebase Admin SDK se send karo.

## 5. iOS (optional)

Agar iOS bhi chahiye:

- Firebase Console me iOS app add karo, **GoogleService-Info.plist** download karo, `ios/<AppName>/` me daalo.
- `cd ios && pod install`
- Xcode me Capabilities se **Push Notifications** enable karo.
