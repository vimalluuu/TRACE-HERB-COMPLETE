// Simple translation system for farmer portal
export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  hi: { name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  te: { name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' }
};

export const TRANSLATIONS = {
  en: {
    // Basic
    selectLanguage: 'Select Language',
    continue: 'Continue',
    welcome: 'Welcome',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    dashboard: 'Dashboard',
    profile: 'Profile',

    // Farmer Info
    farmerInformation: 'Farmer Information',
    farmerPortal: 'Farmer Portal',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    village: 'Village',
    district: 'District',
    state: 'State',
    farmerId: 'Farmer ID',
    experience: 'Experience (Years)',
    certification: 'Certification',

    // Herb Details
    herbDetails: 'Herb Collection Details',
    herbCollection: 'Herb Collection',
    botanicalName: 'Botanical Name',
    commonName: 'Common Name',
    ayurvedicName: 'Ayurvedic Name',
    partUsed: 'Part Used',
    quantity: 'Quantity',
    unit: 'Unit',
    collectionMethod: 'Collection Method',
    season: 'Season',
    weatherConditions: 'Weather Conditions',
    soilType: 'Soil Type',
    notes: 'Additional Notes',

    // Location
    locationDetails: 'Location Details',
    getLocation: 'Get My Location',
    latitude: 'Latitude',
    longitude: 'Longitude',
    captureLocation: 'Capture Collection Location',
    locationRequired: 'Location Required',
    gettingLocation: 'Getting Your Location...',
    locationOnMap: 'Location on Map',
    loadingMap: 'Loading map...',
    locationCaptured: 'Location Captured',
    useDemoLocation: 'Use demo location (for testing only)',
    allowLocationAccess: 'Please allow location access when prompted',
    advancedGPS: 'We use advanced GPS techniques to get your exact coordinates even in challenging conditions',
    preciseLocation: 'We need your precise location to ensure traceability',
    verifyOrigin: 'This helps verify the origin of the herbs',
    interactiveMap: 'Interactive map showing your captured location with marker',

    // Navigation
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    back: 'Back',
    backToDashboard: 'Back to Dashboard',

    // Batch Management
    yourBatches: 'Your Herb Batches',
    batchProgress: 'Batch Progress',
    createNewBatch: 'Create New Batch',
    viewBatch: 'View Batch',
    batchStatus: 'Batch Status',
    approved: 'Approved',
    rejected: 'Rejected',
    inProgress: 'In Progress',
    filter: 'Filter',
    allBatches: 'All Batches',
    batchTracking: 'Batch Tracking',
    trackingDetails: 'Tracking Details',
    batchInformation: 'Batch Information',
    collectionDate: 'Collection Date',
    processingStatus: 'Processing Status',
    qualityStatus: 'Quality Status',
    currentStatus: 'Current Status',
    trackingSteps: 'Tracking Steps',
    completed: 'Completed',
    pending: 'Pending',
    processing: 'Processing',
    tested: 'Tested',
    batchNotFound: 'Batch Not Found',
    generateQRCode: 'Generate QR Code',
    collectionSummary: 'Collection Summary',
    farmer: 'Farmer',
    location: 'Location',
    herb: 'Herb',
    partUsed: 'Part Used',
    quantity: 'Quantity',
    method: 'Method',
    season: 'Season',
    gps: 'GPS',
    submitToBlockchain: 'Submit to Blockchain & Generate QR',
    submittingToBlockchain: 'Submitting to Blockchain...',
    success: 'Success!',
    downloadQRCode: 'Download QR Code',
    addNewCollection: 'Add New Collection',
    collectionID: 'Collection ID',
    updateLocation: 'Update Location',

    // Placeholders
    enterFullName: 'Enter your full name',
    enterPhone: 'Enter phone number',
    enterVillage: 'Enter village name',
    enterDistrict: 'Enter district name',
    selectHerb: 'Select Herb',
    selectPart: 'Select Part Used',
    selectMethod: 'Select Collection Method',
    selectSeason: 'Select Season',
    selectState: 'Select State',
    selectUnit: 'Select Unit',
    enterQuantity: 'Enter quantity',
    enterWeather: 'e.g., Sunny, 25°C, Low humidity',
    enterSoil: 'e.g., Clay, Sandy, Loamy',
    enterNotes: 'Any additional information'
  },
  
  hi: {
    selectLanguage: 'भाषा चुनें',
    continue: 'जारी रखें',
    welcome: 'स्वागत',
    login: 'लॉगिन',
    signup: 'साइन अप',
    logout: 'लॉगआउट',
    dashboard: 'डैशबोर्ड',
    profile: 'प्रोफाइल',

    farmerInformation: 'किसान की जानकारी',
    farmerPortal: 'किसान पोर्टल',
    fullName: 'पूरा नाम',
    phoneNumber: 'फोन नंबर',
    village: 'गांव',
    district: 'जिला',
    state: 'राज्य',
    farmerId: 'किसान आईडी',
    experience: 'अनुभव (वर्ष)',
    certification: 'प्रमाणन',

    herbDetails: 'जड़ी-बूटी संग्रह विवरण',
    herbCollection: 'जड़ी-बूटी संग्रह',
    botanicalName: 'वानस्पतिक नाम',
    commonName: 'सामान्य नाम',
    ayurvedicName: 'आयुर्वेदिक नाम',
    partUsed: 'उपयोग किया गया भाग',
    quantity: 'मात्रा',
    unit: 'इकाई',
    collectionMethod: 'संग्रह विधि',
    season: 'मौसम',
    weatherConditions: 'मौसम की स्थिति',
    soilType: 'मिट्टी का प्रकार',
    notes: 'अतिरिक्त टिप्पणियां',

    locationDetails: 'स्थान विवरण',
    getLocation: 'मेरा स्थान प्राप्त करें',
    latitude: 'अक्षांश',
    longitude: 'देशांतर',
    captureLocation: 'संग्रह स्थान कैप्चर करें',
    locationRequired: 'स्थान आवश्यक',
    gettingLocation: 'आपका स्थान प्राप्त कर रहे हैं...',
    locationOnMap: 'मानचित्र पर स्थान',
    loadingMap: 'मानचित्र लोड हो रहा है...',
    locationCaptured: 'स्थान कैप्चर किया गया',
    useDemoLocation: 'डेमो स्थान का उपयोग करें (केवल परीक्षण के लिए)',
    allowLocationAccess: 'कृपया संकेत मिलने पर स्थान पहुंच की अनुमति दें',
    advancedGPS: 'हम चुनौतीपूर्ण परिस्थितियों में भी आपके सटीक निर्देशांक प्राप्त करने के लिए उन्नत GPS तकनीकों का उपयोग करते हैं',
    preciseLocation: 'ट्रेसेबिलिटी सुनिश्चित करने के लिए हमें आपके सटीक स्थान की आवश्यकता है',
    verifyOrigin: 'यह जड़ी-बूटियों की उत्पत्ति को सत्यापित करने में मदद करता है',
    interactiveMap: 'मार्कर के साथ आपके कैप्चर किए गए स्थान को दिखाने वाला इंटरैक्टिव मानचित्र',

    next: 'अगला',
    previous: 'पिछला',
    submit: 'जमा करें',
    back: 'वापस',
    backToDashboard: 'डैशबोर्ड पर वापस',

    yourBatches: 'आपके जड़ी-बूटी बैच',
    batchProgress: 'बैच प्रगति',
    createNewBatch: 'नया बैच बनाएं',
    viewBatch: 'बैच देखें',
    batchStatus: 'बैच स्थिति',
    approved: 'स्वीकृत',
    rejected: 'अस्वीकृत',
    inProgress: 'प्रगति में',
    filter: 'फिल्टर',
    allBatches: 'सभी बैच',
    batchTracking: 'बैच ट्रैकिंग',
    trackingDetails: 'ट्रैकिंग विवरण',
    batchInformation: 'बैच जानकारी',
    collectionDate: 'संग्रह तिथि',
    processingStatus: 'प्रसंस्करण स्थिति',
    qualityStatus: 'गुणवत्ता स्थिति',
    currentStatus: 'वर्तमान स्थिति',
    trackingSteps: 'ट्रैकिंग चरण',
    completed: 'पूर्ण',
    pending: 'लंबित',
    processing: 'प्रसंस्करण',
    tested: 'परीक्षित',
    batchNotFound: 'बैच नहीं मिला',
    generateQRCode: 'QR कोड जेनरेट करें',
    collectionSummary: 'संग्रह सारांश',
    farmer: 'किसान',
    location: 'स्थान',
    herb: 'जड़ी-बूटी',
    partUsed: 'उपयोग किया गया भाग',
    quantity: 'मात्रा',
    method: 'विधि',
    season: 'मौसम',
    gps: 'GPS',
    submitToBlockchain: 'ब्लॉकचेन में सबमिट करें और QR जेनरेट करें',
    submittingToBlockchain: 'ब्लॉकचेन में सबमिट कर रहे हैं...',
    success: 'सफलता!',
    downloadQRCode: 'QR कोड डाउनलोड करें',
    addNewCollection: 'नया संग्रह जोड़ें',
    collectionID: 'संग्रह ID',
    updateLocation: 'स्थान अपडेट करें',

    enterFullName: 'अपना पूरा नाम दर्ज करें',
    enterPhone: 'फोन नंबर दर्ज करें',
    enterVillage: 'गांव का नाम दर्ज करें',
    enterDistrict: 'जिले का नाम दर्ज करें',
    selectHerb: 'जड़ी-बूटी चुनें',
    selectPart: 'उपयोग किया गया भाग चुनें',
    selectMethod: 'संग्रह विधि चुनें',
    selectSeason: 'मौसम चुनें',
    selectState: 'राज्य चुनें',
    selectUnit: 'इकाई चुनें',
    enterQuantity: 'मात्रा दर्ज करें',
    enterWeather: 'जैसे, धूप, 25°C, कम आर्द्रता',
    enterSoil: 'जैसे, चिकनी, रेतीली, दोमट',
    enterNotes: 'कोई अतिरिक्त जानकारी'
  },
  
  ta: {
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    continue: 'தொடரவும்',
    welcome: 'வரவேற்கிறோம்',
    login: 'உள்நுழைவு',
    signup: 'பதிவு செய்யவும்',
    logout: 'வெளியேறு',
    dashboard: 'டாஷ்போர்டு',
    profile: 'சுயவிவரம்',

    farmerInformation: 'விவசாயி தகவல்',
    farmerPortal: 'விவசாயி போர்டல்',
    fullName: 'முழு பெயர்',
    phoneNumber: 'தொலைபேசி எண்',
    village: 'கிராமம்',
    district: 'மாவட்டம்',
    state: 'மாநிலம்',
    farmerId: 'விவசாயி அடையாள எண்',
    experience: 'அனுபவம் (ஆண்டுகள்)',
    certification: 'சான்றிதழ்',

    herbDetails: 'மூலிகை சேகரிப்பு விவரங்கள்',
    herbCollection: 'மூலிகை சேகரிப்பு',
    botanicalName: 'தாவரவியல் பெயர்',
    commonName: 'பொதுவான பெயர்',
    ayurvedicName: 'ஆயுர்வேத பெயர்',
    partUsed: 'பயன்படுத்தப்பட்ட பகுதி',
    quantity: 'அளவு',
    unit: 'அலகு',
    collectionMethod: 'சேகரிப்பு முறை',
    season: 'பருவம்',
    weatherConditions: 'வானிலை நிலைமைகள்',
    soilType: 'மண் வகை',
    notes: 'கூடுதல் குறிப்புகள்',

    locationDetails: 'இடம் விவரங்கள்',
    getLocation: 'என் இடத்தைப் பெறவும்',
    latitude: 'அட்சரேகை',
    longitude: 'தீர்க்கரேகை',
    captureLocation: 'சேகரிப்பு இடத்தைப் பிடிக்கவும்',
    locationRequired: 'இடம் தேவை',
    gettingLocation: 'உங்கள் இடத்தைப் பெறுகிறோம்...',
    locationOnMap: 'வரைபடத்தில் இடம்',
    loadingMap: 'வரைபடம் ஏற்றப்படுகிறது...',
    locationCaptured: 'இடம் பிடிக்கப்பட்டது',
    useDemoLocation: 'டெமோ இடத்தைப் பயன்படுத்தவும் (சோதனைக்கு மட்டும்)',
    allowLocationAccess: 'கேட்கப்படும்போது இட அணுகலை அனுமதிக்கவும்',
    advancedGPS: 'சவாலான சூழ்நிலைகளிலும் உங்கள் சரியான ஆயத்தொலைவுகளைப் பெற நாங்கள் மேம்பட்ட GPS நுட்பங்களைப் பயன்படுத்துகிறோம்',
    preciseLocation: 'கண்டறியும் திறனை உறுதிப்படுத்த உங்கள் துல்லியமான இடம் தேவை',
    verifyOrigin: 'இது மூலிகைகளின் தோற்றத்தை சரிபார்க்க உதவுகிறது',
    interactiveMap: 'மார்க்கருடன் உங்கள் பிடிக்கப்பட்ட இடத்தைக் காட்டும் ஊடாடும் வரைபடம்',

    next: 'அடுத்து',
    previous: 'முந்தைய',
    submit: 'சமர்ப்பிக்கவும்',
    back: 'திரும்பு',
    backToDashboard: 'டாஷ்போர்டுக்கு திரும்பு',

    yourBatches: 'உங்கள் மூலிகை தொகுப்புகள்',
    batchProgress: 'தொகுப்பு முன்னேற்றம்',
    createNewBatch: 'புதிய தொகுப்பை உருவாக்கவும்',
    viewBatch: 'தொகுப்பைப் பார்க்கவும்',
    batchStatus: 'தொகுப்பு நிலை',
    approved: 'ஒப்புதல்',
    rejected: 'நிராகரிக்கப்பட்டது',
    inProgress: 'முன்னேற்றத்தில்',
    filter: 'வடிகட்டி',
    allBatches: 'அனைத்து தொகுப்புகள்',
    batchTracking: 'தொகுப்பு கண்காணிப்பு',
    trackingDetails: 'கண்காணிப்பு விவரங்கள்',
    batchInformation: 'தொகுப்பு தகவல்',
    collectionDate: 'சேகரிப்பு தேதி',
    processingStatus: 'செயலாக்க நிலை',
    qualityStatus: 'தரம் நிலை',
    currentStatus: 'தற்போதைய நிலை',
    trackingSteps: 'கண்காணிப்பு படிகள்',
    completed: 'முடிந்தது',
    pending: 'நிலுவையில்',
    processing: 'செயலாக்கம்',
    tested: 'சோதிக்கப்பட்டது',
    batchNotFound: 'தொகுப்பு கிடைக்கவில்லை',
    generateQRCode: 'QR குறியீடு உருவாக்கவும்',
    collectionSummary: 'சேகரிப்பு சுருக்கம்',
    farmer: 'விவசாயி',
    location: 'இடம்',
    herb: 'மூலிகை',
    partUsed: 'பயன்படுத்தப்பட்ட பகுதி',
    quantity: 'அளவு',
    method: 'முறை',
    season: 'பருவம்',
    gps: 'GPS',
    submitToBlockchain: 'பிளாக்செயினில் சமர்பிக்கவும் & QR உருவாக்கவும்',
    submittingToBlockchain: 'பிளாக்செயினில் சமர்பிக்கிறோம்...',
    success: 'வெற்றி!',
    downloadQRCode: 'QR குறியீடு பதிவிறக்கவும்',
    addNewCollection: 'புதிய சேகரிப்பு சேர்க்கவும்',
    collectionID: 'சேகரிப்பு ID',
    updateLocation: 'இடத்தை புதுப்பிக்கவும்',

    enterFullName: 'உங்கள் முழு பெயரை உள்ளிடவும்',
    enterPhone: 'தொலைபேசி எண்ணை உள்ளிடவும்',
    enterVillage: 'கிராமத்தின் பெயரை உள்ளிடவும்',
    enterDistrict: 'மாவட்டத்தின் பெயரை உள்ளிடவும்',
    selectHerb: 'மூலிகையைத் தேர்ந்தெடுக்கவும்',
    selectPart: 'பயன்படுத்தப்பட்ட பகுதியைத் தேர்ந்தெடுக்கவும்',
    selectMethod: 'சேகரிப்பு முறையைத் தேர்ந்தெடுக்கவும்',
    selectSeason: 'பருவத்தைத் தேர்ந்தெடுக்கவும்',
    selectState: 'மாநிலத்தைத் தேர்ந்தெடுக்கவும்',
    selectUnit: 'அலகைத் தேர்ந்தெடுக்கவும்',
    enterQuantity: 'அளவை உள்ளிடவும்',
    enterWeather: 'எ.கா., வெயில், 25°C, குறைந்த ஈரப்பதம்',
    enterSoil: 'எ.கா., களிமண், மணல், கலப்பு',
    enterNotes: 'ஏதேனும் கூடுதல் தகவல்'
  },
  
  te: {
    selectLanguage: 'భాషను ఎంచుకోండి',
    continue: 'కొనసాగించండి',
    welcome: 'స్వాగతం',
    login: 'లాగిన్',
    signup: 'సైన్ అప్',
    logout: 'లాగ్ అవుట్',
    dashboard: 'డాష్‌బోర్డ్',
    profile: 'ప్రొఫైల్',

    farmerInformation: 'రైతు సమాచారం',
    farmerPortal: 'రైతు పోర్టల్',
    fullName: 'పూర్తి పేరు',
    phoneNumber: 'ఫోన్ నంబర్',
    village: 'గ్రామం',
    district: 'జిల్లా',
    state: 'రాష్ట్రం',
    farmerId: 'రైతు ID',
    experience: 'అనుభవం (సంవత్సరాలు)',
    certification: 'ధృవీకరణ',

    herbDetails: 'మూలిక సేకరణ వివరాలు',
    herbCollection: 'మూలిక సేకరణ',
    botanicalName: 'వృక్షశాస్త్ర పేరు',
    commonName: 'సాధారణ పేరు',
    ayurvedicName: 'ఆయుర్వేద పేరు',
    partUsed: 'ఉపయోగించిన భాగం',
    quantity: 'పరిమాణం',
    unit: 'యూనిట్',
    collectionMethod: 'సేకరణ పద్ధతి',
    season: 'సీజన్',
    weatherConditions: 'వాతావరణ పరిస్థితులు',
    soilType: 'మట్టి రకం',
    notes: 'అదనపు గమనికలు',

    locationDetails: 'స్థాన వివరాలు',
    getLocation: 'నా స్థానాన్ని పొందండి',
    latitude: 'అక్షాంశం',
    longitude: 'రేఖాంశం',
    captureLocation: 'సేకరణ స్థానాన్ని క్యాప్చర్ చేయండి',
    locationRequired: 'స్థానం అవసరం',
    gettingLocation: 'మీ స్థానాన్ని పొందుతున్నాము...',
    locationOnMap: 'మ్యాప్‌లో స్థానం',
    loadingMap: 'మ్యాప్ లోడ్ అవుతోంది...',
    locationCaptured: 'స్థానం క్యాప్చర్ చేయబడింది',
    useDemoLocation: 'డెమో స్థానాన్ని ఉపయోగించండి (పరీక్ష కోసం మాత్రమే)',
    allowLocationAccess: 'అడిగినప్పుడు దయచేసి స్థాన యాక్సెస్‌ను అనుమతించండి',
    advancedGPS: 'సవాలు పరిస్థితుల్లో కూడా మీ ఖచ్చితమైన కోఆర్డినేట్‌లను పొందడానికి మేము అధునాతన GPS పద్ధతులను ఉపయోగిస్తాము',
    preciseLocation: 'ట్రేసబిలిటీని నిర్ధారించడానికి మాకు మీ ఖచ్చితమైన స్థానం అవసరం',
    verifyOrigin: 'ఇది మూలికల మూలాన్ని ధృవీకరించడంలో సహాయపడుతుంది',
    interactiveMap: 'మార్కర్‌తో మీ క్యాప్చర్ చేసిన స్థానాన్ని చూపించే ఇంటరాక్టివ్ మ్యాప్',

    next: 'తదుపరి',
    previous: 'మునుపటి',
    submit: 'సమర్పించండి',
    back: 'వెనుకకు',
    backToDashboard: 'డాష్‌బోర్డ్‌కు తిరిగి',

    yourBatches: 'మీ మూలిక బ్యాచ్‌లు',
    batchProgress: 'బ్యాచ్ పురోగతి',
    createNewBatch: 'కొత్త బ్యాచ్ సృష్టించండి',
    viewBatch: 'బ్యాచ్ చూడండి',
    batchStatus: 'బ్యాచ్ స్థితి',
    approved: 'ఆమోదించబడింది',
    rejected: 'తిరస్కరించబడింది',
    inProgress: 'పురోగతిలో',
    filter: 'ఫిల్టర్',
    allBatches: 'అన్ని బ్యాచ్‌లు',
    batchTracking: 'బ్యాచ్ ట్రాకింగ్',
    trackingDetails: 'ట్రాకింగ్ వివరాలు',
    batchInformation: 'బ్యాచ్ సమాచారం',
    collectionDate: 'సేకరణ తేదీ',
    processingStatus: 'ప్రాసెసింగ్ స్థితి',
    qualityStatus: 'నాణ్యత స్థితి',
    currentStatus: 'ప్రస్తుత స్థితి',
    trackingSteps: 'ట్రాకింగ్ దశలు',
    completed: 'పూర్తయింది',
    pending: 'పెండింగ్',
    processing: 'ప్రాసెసింగ్',
    tested: 'పరీక్షించబడింది',
    batchNotFound: 'బ్యాచ్ కనుగొనబడలేదు',
    generateQRCode: 'QR కోడ్ జనరేట్ చేయండి',
    collectionSummary: 'సేకరణ సారాంశం',
    farmer: 'రైతు',
    location: 'స్థానం',
    herb: 'మూలిక',
    partUsed: 'ఉపయోగించిన భాగం',
    quantity: 'పరిమాణం',
    method: 'పద్ధతి',
    season: 'సీజన్',
    gps: 'GPS',
    submitToBlockchain: 'బ్లాక్‌చెయిన్‌కు సమర్పించండి & QR జనరేట్ చేయండి',
    submittingToBlockchain: 'బ్లాక్‌చెయిన్‌కు సమర్పిస్తున్నాము...',
    success: 'విజయం!',
    downloadQRCode: 'QR కోడ్ డౌన్‌లోడ్ చేయండి',
    addNewCollection: 'కొత్త సేకరణ జోడించండి',
    collectionID: 'సేకరణ ID',
    updateLocation: 'స్థానాన్ని అప్‌డేట్ చేయండి',

    enterFullName: 'మీ పూర్తి పేరును నమోదు చేయండి',
    enterPhone: 'ఫోన్ నంబర్‌ను నమోదు చేయండి',
    enterVillage: 'గ్రామం పేరును నమోదు చేయండి',
    enterDistrict: 'జిల్లా పేరును నమోదు చేయండి',
    selectHerb: 'మూలికను ఎంచుకోండి',
    selectPart: 'ఉపయోగించిన భాగాన్ని ఎంచుకోండి',
    selectMethod: 'సేకరణ పద్ధతిని ఎంచుకోండి',
    selectSeason: 'సీజన్‌ను ఎంచుకోండి',
    selectState: 'రాష్ట్రాన్ని ఎంచుకోండి',
    selectUnit: 'యూనిట్‌ను ఎంచుకోండి',
    enterQuantity: 'పరిమాణాన్ని నమోదు చేయండి',
    enterWeather: 'ఉదా., ఎండ, 25°C, తక్కువ తేమ',
    enterSoil: 'ఉదా., మట్టి, ఇసుక, మిశ్రమ',
    enterNotes: 'ఏదైనా అదనపు సమాచారం'
  }
};

// Herb options with translations
export const HERBS = {
  turmeric: {
    en: { botanical: 'Curcuma longa', common: 'Turmeric', ayurvedic: 'Haridra' },
    hi: { botanical: 'Curcuma longa', common: 'हल्दी', ayurvedic: 'हरिद्रा' },
    ta: { botanical: 'Curcuma longa', common: 'மஞ்சள்', ayurvedic: 'ஹரித்ரா' },
    te: { botanical: 'Curcuma longa', common: 'పసుపు', ayurvedic: 'హరిద్రా' }
  },
  neem: {
    en: { botanical: 'Azadirachta indica', common: 'Neem', ayurvedic: 'Nimba' },
    hi: { botanical: 'Azadirachta indica', common: 'नीम', ayurvedic: 'निम्ब' },
    ta: { botanical: 'Azadirachta indica', common: 'வேம்பு', ayurvedic: 'நிம்பா' },
    te: { botanical: 'Azadirachta indica', common: 'వేప', ayurvedic: 'నింబా' }
  },
  tulsi: {
    en: { botanical: 'Ocimum sanctum', common: 'Holy Basil', ayurvedic: 'Tulsi' },
    hi: { botanical: 'Ocimum sanctum', common: 'तुलसी', ayurvedic: 'तुलसी' },
    ta: { botanical: 'Ocimum sanctum', common: 'துளசி', ayurvedic: 'துளசி' },
    te: { botanical: 'Ocimum sanctum', common: 'తులసి', ayurvedic: 'తులసి' }
  },
  ginger: {
    en: { botanical: 'Zingiber officinale', common: 'Ginger', ayurvedic: 'Ardraka' },
    hi: { botanical: 'Zingiber officinale', common: 'अदरक', ayurvedic: 'आर्द्रक' },
    ta: { botanical: 'Zingiber officinale', common: 'இஞ்சி', ayurvedic: 'ஆர்த்ரகா' },
    te: { botanical: 'Zingiber officinale', common: 'అల్లం', ayurvedic: 'ఆర్ద్రకా' }
  },
  ashwagandha: {
    en: { botanical: 'Withania somnifera', common: 'Winter Cherry', ayurvedic: 'Ashwagandha' },
    hi: { botanical: 'Withania somnifera', common: 'अश्वगंधा', ayurvedic: 'अश्वगंधा' },
    ta: { botanical: 'Withania somnifera', common: 'அஸ்வகந்தா', ayurvedic: 'அஸ்வகந்தா' },
    te: { botanical: 'Withania somnifera', common: 'అశ్వగంధ', ayurvedic: 'అశ్వగంధ' }
  },
  brahmi: {
    en: { botanical: 'Bacopa monnieri', common: 'Water Hyssop', ayurvedic: 'Brahmi' },
    hi: { botanical: 'Bacopa monnieri', common: 'ब्राह्मी', ayurvedic: 'ब्राह्मी' },
    ta: { botanical: 'Bacopa monnieri', common: 'பிரம்மி', ayurvedic: 'பிரம்மி' },
    te: { botanical: 'Bacopa monnieri', common: 'బ్రాహ్మి', ayurvedic: 'బ్రాహ్మి' }
  },
  fenugreek: {
    en: { botanical: 'Trigonella foenum-graecum', common: 'Fenugreek', ayurvedic: 'Methi' },
    hi: { botanical: 'Trigonella foenum-graecum', common: 'मेथी', ayurvedic: 'मेथी' },
    ta: { botanical: 'Trigonella foenum-graecum', common: 'வெந்தயம்', ayurvedic: 'வெந்தயம்' },
    te: { botanical: 'Trigonella foenum-graecum', common: 'మెంతులు', ayurvedic: 'మెంతులు' }
  },
  coriander: {
    en: { botanical: 'Coriandrum sativum', common: 'Coriander', ayurvedic: 'Dhanyaka' },
    hi: { botanical: 'Coriandrum sativum', common: 'धनिया', ayurvedic: 'धन्यक' },
    ta: { botanical: 'Coriandrum sativum', common: 'கொத்தமல்லி', ayurvedic: 'தன்யகா' },
    te: { botanical: 'Coriandrum sativum', common: 'కొత్తిమీర', ayurvedic: 'ధన్యకా' }
  }
};

// Dropdown options
export const PARTS_USED = {
  en: ['Root', 'Stem', 'Leaf', 'Flower', 'Fruit', 'Seed', 'Bark', 'Whole Plant', 'Rhizome'],
  hi: ['जड़', 'तना', 'पत्ती', 'फूल', 'फल', 'बीज', 'छाल', 'पूरा पौधा', 'प्रकंद'],
  ta: ['வேர்', 'தண்டு', 'இலை', 'பூ', 'பழம்', 'விதை', 'பட்டை', 'முழு செடி', 'வேர்த்தண்டு'],
  te: ['వేరు', 'కాండం', 'ఆకు', 'పువ్వు', 'పండు', 'విత్తనం', 'బెరడు', 'మొత్తం మొక్క', 'వేరుకాండం']
};

export const COLLECTION_METHODS = {
  en: ['Hand Picking', 'Cutting with Knife', 'Digging', 'Traditional Method', 'Sustainable Harvesting', 'Wild Collection'],
  hi: ['हाथ से चुनना', 'चाकू से काटना', 'खोदना', 'पारंपरिक विधि', 'टिकाऊ कटाई', 'जंगली संग्रह'],
  ta: ['கையால் பறித்தல்', 'கத்தியால் வெட்டுதல்', 'தோண்டுதல்', 'பாரம்பரிய முறை', 'நிலையான அறுவடை', 'காட்டு சேகரிப்பு'],
  te: ['చేతితో తీయడం', 'కత్తితో కత్తిరించడం', 'తవ్వడం', 'సాంప్రదాయ పద్ధతి', 'స్థిరమైన కోత', 'అడవి సేకరణ']
};

export const SEASONS = {
  en: ['Spring (Mar-May)', 'Summer (Jun-Aug)', 'Monsoon (Jul-Sep)', 'Post-Monsoon (Oct-Nov)', 'Winter (Dec-Feb)'],
  hi: ['वसंत (मार्च-मई)', 'गर्मी (जून-अगस्त)', 'मानसून (जुलाई-सितंबर)', 'मानसून के बाद (अक्टूबर-नवंबर)', 'सर्दी (दिसंबर-फरवरी)'],
  ta: ['வசந்தம் (மார்-மே)', 'கோடை (ஜூன்-ஆக)', 'மழைக்காலம் (ஜூலை-செப்)', 'மழைக்கு பின் (அக்-நவ)', 'குளிர்காலம் (டிச-பிப)'],
  te: ['వసంతం (మార్-మే)', 'వేసవి (జూన్-ఆగ)', 'వర్షాకాలం (జూలై-సెప్)', 'వర్షాల తర్వాత (అక్-నవ)', 'శీతాకాలం (డిస్-ఫిబ్)']
};

export const UNITS = {
  en: ['kg', 'grams', 'bundles', 'pieces', 'liters', 'bags'],
  hi: ['किलो', 'ग्राम', 'बंडल', 'टुकड़े', 'लीटर', 'बैग'],
  ta: ['கிலோ', 'கிராம்', 'கட்டு', 'துண்டுகள்', 'லிட்டர்', 'பைகள்'],
  te: ['కిలో', 'గ్రాములు', 'కట్టలు', 'ముక్కలు', 'లీటర్లు', 'సంచులు']
};

export const STATES = {
  en: ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Uttarakhand', 'Himachal Pradesh', 'Other'],
  hi: ['आंध्र प्रदेश', 'कर्नाटक', 'केरल', 'तमिल नाडु', 'तेलंगाना', 'महाराष्ट्र', 'गुजरात', 'राजस्थान', 'मध्य प्रदेश', 'उत्तराखंड', 'हिमाचल प्रदेश', 'अन्य'],
  ta: ['ஆந்திர பிரதேசம்', 'கர்நாடகா', 'கேரளா', 'தமிழ் நாடு', 'தெலங்கானா', 'மகாராஷ்டிரா', 'குஜராத்', 'ராஜஸ்தான்', 'மத்திய பிரதேசம்', 'உத்தராகண்ட்', 'ஹிமாச்சல் பிரதேசம்', 'மற்றவை'],
  te: ['ఆంధ్రప్రదేశ్', 'కర్ణాటక', 'కేరళ', 'తమిళనాడు', 'తెలంగాణ', 'మహారాష్ట్ర', 'గుజరాత్', 'రాజస్థాన్', 'మధ్యప్రదేశ్', 'ఉత్తరాఖండ్', 'హిమాచల్ ప్రదేశ్', 'ఇతరులు']
};

export const SOIL_TYPES = {
  en: ['Clay', 'Sandy', 'Loamy', 'Black Cotton', 'Red Soil', 'Alluvial', 'Rocky', 'Mixed'],
  hi: ['चिकनी मिट्टी', 'रेतीली', 'दोमट', 'काली कपास', 'लाल मिट्टी', 'जलोढ़', 'चट्टानी', 'मिश्रित'],
  ta: ['களிமண்', 'மணல்', 'கலப்பு மண்', 'கருப்பு பருத்தி', 'சிவப்பு மண்', 'வண்டல்', 'பாறை', 'கலவை'],
  te: ['మట్టి', 'ఇసుక', 'మిశ్రమ', 'నల్ల పత్తి', 'ఎర్ర మట్టి', 'వంపు', 'రాతి', 'మిశ్రమ']
};

// Helper functions
export const t = (key, lang = 'en') => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
};

export const getHerbOptions = (lang = 'en') => {
  return Object.keys(HERBS).map(key => ({
    key,
    ...HERBS[key][lang] || HERBS[key].en
  }));
};

export const getDropdownOptions = (type, lang = 'en') => {
  const options = {
    partsUsed: PARTS_USED,
    collectionMethods: COLLECTION_METHODS,
    seasons: SEASONS,
    units: UNITS,
    states: STATES,
    soilTypes: SOIL_TYPES
  };
  return options[type]?.[lang] || options[type]?.en || [];
};

// Enhanced herb selector that returns full herb data
export const getHerbByCommonName = (commonName, lang = 'en') => {
  const herbKey = Object.keys(HERBS).find(key =>
    HERBS[key][lang]?.common === commonName
  );
  return herbKey ? HERBS[herbKey][lang] : null;
};
