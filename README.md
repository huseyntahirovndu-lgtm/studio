# İstedad Mərkəzi - Naxçıvan Dövlət Universiteti

Bu sənəd, "İstedad Mərkəzi" veb-platformasının istifadəsi üçün ətraflı təlimatdır. Platforma dörd fərqli istifadəçi növü üçün nəzərdə tutulub: **Tələbə**, **Təşkilat**, **Tələbə Təşkilatı Rəhbəri** və **Admin**.

---

## 1. Tələbə üçün Təlimat

**Məqsəd:** Potensialınızı nümayiş etdirmək, bacarıqlarınızı və layihələrinizi təşkilatlara təqdim etmək.

#### **Qeydiyyat və Giriş**
1.  **Hesab Yaratma:**
    *   Ana səhifədəki "Qeydiyyat" düyməsinə, sonra "Tələbə kimi" seçimini edin.
    *   `register-student` səhifəsində tələb olunan məlumatları (ad, soyad, e-poçt, şifrə, fakültə, ixtisas və s.) doldurun.
    *   Hesabınız yaradıldıqdan sonra admin tərəfindən təsdiqlənməsi üçün gözləmə statusunda olacaq.
2.  **Giriş:**
    *   `/login` səhifəsinə daxil olaraq e-poçt və şifrənizlə hesabınıza daxil olun.
    *   Uğurlu girişdən sonra **Tələbə Panelinə** (`/student-dashboard`) yönləndiriləcəksiniz.

#### **Tələbə Paneli (`/student-dashboard`)**
Bu panel sizin idarəetmə mərkəzinizdir.
*   **Profil Tamlığı:** Profilinizi nə qədər doldurduğunuzu faizlə göstərir. 100%-ə yaxınlaşdırmaq üçün profilinizi daim yeniləyin.
*   **Statistika:** İstedad balınızı, layihə, nailiyyət və sertifikatlarınızın ümumi sayını görə bilərsiniz.
*   **Layihə Dəvətləri:** Təşkilatlardan gələn layihə təkliflərini burada görüb qəbul və ya rədd edə bilərsiniz.
*   **AI Profil Məsləhətçisi:** Süni intellektdən profilinizi daha cəlbedici etmək üçün fərdi tövsiyələr alın.

#### **Profilin İdarə Edilməsi (`/profile/edit`)**
Bu, platformadakı ən vacib səhifənizdir.
*   **Şəxsi Məlumatlar:** Ad, soyad, ixtisas, kurs, GPA və sosial media linklərinizi (LinkedIn, GitHub, Behance və s.) əlavə edib yeniləyə bilərsiniz.
*   **Bacarıqlar:** Sahibi olduğunuz bacarıqları səviyyələri ilə (Başlanğıc, Orta, İrəli) birlikdə daxil edin.
*   **Layihələr:** İştirak etdiyiniz və ya özünüzün hazırladığı layihələri detallı təsviri, komanda üzvləri və linkləri ilə birlikdə əlavə edin.
*   **Nailiyyətlər:** Qazandığınız uğurları (olimpiada, müsabiqə, konfrans və s.) səviyyəsi və tarixi ilə qeyd edin.
*   **Sertifikatlar:** Əldə etdiyiniz sertifikatların linklərini və adlarını əlavə edin.

**İctimai Profil (`/profile/[id]`):** Bu səhifə, profilinizin təşkilatlar və digər istifadəçilər tərəfindən necə göründüyünü göstərir.

---

## 2. Təşkilat üçün Təlimat

**Məqsəd:** Universitetin istedadlı tələbələrini kəşf etmək, onlarla əlaqə qurmaq və layihələrə cəlb etmək.

#### **Qeydiyyat və Giriş**
1.  **Hesab Yaratma:**
    *   Ana səhifədə "Qeydiyyat" düyməsinə, sonra isə "Təşkilat kimi" seçiminə klikləyin.
    *   `register-organization` səhifəsində təşkilatınızın məlumatlarını (ad, rəsmi ad, sektor, e-poçt, şifrə) daxil edin.
2.  **Giriş:**
    *   `/login` səhifəsindən hesabınıza daxil olun. Uğurlu girişdən sonra **Təşkilat Panelinə** (`/organization-dashboard`) yönləndiriləcəksiniz.

#### **Təşkilat Paneli (`/organization-dashboard`)**
*   **Əsas Funksiyalar:** Buradan birbaşa "İstedadları Kəşf Et" (`/search`) və "Reytinqlər" (`/rankings`) səhifələrinə keçid edə bilərsiniz.
*   **Yadda Saxlanılan Tələbələr:** Axtarış zamanı bəyəndiyiniz və "Yadda Saxla" düyməsinə basdığınız tələbələrin siyahısını burada görə bilərsiniz.
*   **Layihələrim:** Öz layihələrinizi yaradıb idarə edə bilərsiniz (`/organization-profile/edit` səhifəsindən).

#### **İstedadların Kəşfi və İdarəsi**
*   **Axtarış və Filtr (`/search`):**
    *   Fakültə, kurs, bacarıq, istedad kateqoriyası kimi çoxsaylı filtrlərdən istifadə edərək spesifik tələbələri tapın.
    *   "Yüksək Potensiallı", "Startap Potensiallı" kimi hazır sürətli filtrlərdən istifadə edin.
*   **Profilə Baxış (`/profile/[id]`):**
    *   Tələbənin bütün məlumatlarına, o cümlədən layihələrinə, nailiyyətlərinə və sosial linklərinə tam şəkildə baxa bilərsiniz.
*   **Layihəyə Dəvət:**
    *   Tələbənin profilindəki "Dəvət et" düyməsinə basaraq onu öz layihələrinizdən birinə dəvət edə bilərsiniz. Tələbənin cavabı sizə bildiriş şəklində gələcək.

---

## 3. Tələbə Təşkilatı Rəhbəri üçün Təlimat

**Məqsəd:** Rəhbərlik etdiyiniz tələbə təşkilatını idarə etmək, üzvləri əlavə edib/çıxarmaq və yenilikləri paylaşmaq.

#### **Giriş**
* Tələbə hesabınızla `/login` səhifəsindən daxil olun. Əgər admin tərəfindən bir təşkilatın rəhbəri təyin edilmisinizsə, naviqasiya menyusunda Təşkilat Panelinə keçid görəcəksiniz.

#### **Təşkilat Paneli (`/organization/dashboard`)**
* **Panel:** Təşkilatınızın ümumi statistikası, üzv sayı və son fəaliyyətlər.
* **Üzvlər (`/organization/members`):** Təşkilata yeni üzvlər (tələbələr) əlavə edə və ya mövcud üzvləri siyahıdan çıxara bilərsiniz.
* **Yeniliklər (`/organization/updates`):** Təşkilatınızın fəaliyyəti ilə bağlı xəbərlər, elanlar və yeniliklər yaradıb paylaşa bilərsiniz.

---

## 4. Admin üçün Təlimat

**Məqsəd:** Platformanın ümumi fəaliyyətinə nəzarət etmək, məlumatların düzgünlüyünü təmin etmək və sistemi idarə etmək.

#### **Giriş**
*   **Email:** `admin@ndu.edu.az`
*   **Şifrə:** `adminpassword`

Bu məlumatlarla `/login` səhifəsindən daxil olduqda birbaşa **Admin Panelə** (`/admin/dashboard`) yönləndiriləcəksiniz.

#### **Admin Paneli (`/admin/dashboard`)**
*   **Dashboard:** Ümumi statistikanı (tələbə sayı, təşkilat sayı, aktivlik) və sistemə yeni qoşulan tələbələri izləyə bilərsiniz.
*   **Tələbələr (`/admin/students`):**
    *   Bütün tələbələrin siyahısını görə bilərsiniz.
    *   Yeni qeydiyyatdan keçmiş tələbələrin statusunu "gözləyir"-dən "təsdiqlənmiş"-ə dəyişə bilərsiniz.
    *   Lazım gəldikdə tələbə profillərini redaktə edə və ya sistemdən silə bilərsiniz.
*   **Təşkilatlar (`/admin/organizations`):**
    *   Sistemdəki bütün partnyor təşkilatların siyahısını idarə edə bilərsiniz.
*   **Tələbə Təşkilatları (`/admin/telebe-teskilatlari`):**
    *   Universitet daxilində fəaliyyət göstərən tələbə təşkilatlarını yarada, redaktə edə və statuslarını (təsdiqlənmiş, gözləyir, arxivlənmiş) dəyişə bilərsiniz.
*   **Xəbərlər (`/admin/news`):**
    *   Platforma üçün ümumi xəbərlər və elanlar yaradıb idarə edə bilərsiniz.
*   **Kateqoriyalar (`/admin/categories`):**
    *   Sistemə yeni istedad kateqoriyaları əlavə edə və ya mövcud olanları silə bilərsiniz. Bu, axtarış və filtr sisteminə birbaşa təsir edir.
