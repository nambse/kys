// spreadsheetTranslations.js
const translations = {
    uploadStep: {
        title: "Dosya Yükleme",
        manifestTitle: "Beklenen Veri Detayları:",
        manifestDescription: "(Sonraki adımlarda sütun isimlerini değiştirebilir ya da kaldırabilirsiniz)",
        maxRecordsExceeded: (maxRecords) => `Kayıt limiti aşıldı. Maksimum ${maxRecords} kayıt kabul edilmektedir.`,
        dropzone: {
            title: ".xlsx, .xls veya .csv dosyası yükleyiniz",
            errorToastDescription: "yüklemeniz reddedildi",
            activeDropzoneTitle: "Dosyayı buraya sürükleyip bırakın...",
            buttonTitle: "Dosya Seç",
            loadingTitle: "İşleniyor...",
        },
        selectSheet: {
            title: "Kullanılacak Çalışma Sayfasını Seçin",
            nextButtonTitle: "İleri",
            backButtonTitle: "Geri",
        },
    },
    selectHeaderStep: {
        title: "Başlık Satırını Seçin",
        nextButtonTitle: "İleri",
        backButtonTitle: "Geri",
    },
    matchColumnsStep: {
        title: "Sütunları Eşleştirme",
        nextButtonTitle: "İleri",
        backButtonTitle: "Geri",
        userTableTitle: "Tablonuz",
        templateTitle: "Şu Hale Gelecek",
        selectPlaceholder: "Sütun Seçiniz...",
        ignoredColumnText: "Yoksayılan Sütun",
        subSelectPlaceholder: "Seçiniz...",
        matchDropdownTitle: "Eşleştirme",
        unmatched: "Eşleşmeyen",
        duplicateColumnWarningTitle: "Başka Bir Sütun Seçilmedi",
        duplicateColumnWarningDescription: "Sütunlar tekrar edemez",
    },
    validationStep: {
        title: "Veri Doğrulama",
        nextButtonTitle: "Onayla",
        backButtonTitle: "Geri",
        noRowsMessage: "Veri Bulunamadı",
        noRowsMessageWhenFiltered: "Hata İçeren Veri Bulunamadı",
        discardButtonTitle: "Seçilen Satırları Sil",
        filterSwitchTitle: "Yalnızca Hatalı Satırları Göster",
    },
    alerts: {
        confirmClose: {
            headerTitle: "İçe Aktarma İşleminden Çık",
            bodyText: "Emin misiniz? Mevcut bilgileriniz kaydedilmeyecek.",
            cancelButtonTitle: "İptal",
            exitButtonTitle: "İşlemden Çık",
        },
        submitIncomplete: {
            headerTitle: "Hata Tespit Edildi",
            bodyText: "Hala hata içeren satırlar var. Hatalı satırlar gönderilirken dikkate alınmayacak.",
            bodyTextSubmitForbidden: "Hala hata içeren satırlar mevcut.",
            cancelButtonTitle: "İptal",
            finishButtonTitle: "Gönder",
        },
        submitError: {
            title: "Hata",
            defaultMessage: "Veri gönderimi sırasında bir hata meydana geldi",
        },
        unmatchedRequiredFields: {
            headerTitle: "Tüm Sütunlar Eşleşmedi",
            bodyText: "Eşleştirilmemiş veya yoksayılan zorunlu sütunlar var. Devam etmek istiyor musunuz?",
            listTitle: "Eşleşmeyen Sütunlar:",
            cancelButtonTitle: "İptal",
            continueButtonTitle: "Devam Et",
        },
        toast: {
            error: "Hata",
        },
    }
};

export default translations;
