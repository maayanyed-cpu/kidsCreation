/**
 * Hebrew translations for known seed/mock insight content.
 * Maps English free-text strings to Hebrew equivalents.
 *
 * In production, the AI generates Hebrew content directly when locale="he".
 * This map only covers the seeded mock data for dev/demo mode.
 */

// ── Milestones ────────────────────────────────────────────────────────────────
const MILESTONE_HE: Record<string, string> = {
  "Emerging pattern recognition — Zohar's tiger stripes show she understands how patterns create texture and identity in animals.":
    "זיהוי דפוסים מתפתח — הפסים של הנמר של זוהר מראים שהיא מבינה איך דפוסים יוצרים מרקם וזהות אצל חיות.",

  "First self-portrait with full facial features! In her February drawing, Zohar included eyes, nose, mouth, ears, and even hair — a significant leap in self-awareness and observational skill.":
    "דיוקן עצמי ראשון עם כל תווי הפנים! בציור של פברואר, זוהר כללה עיניים, אף, פה, אוזניים ואפילו שיער — קפיצה משמעותית במודעות עצמית ויכולת תצפית.",

  "Zohar created her most compositionally complex artwork yet — a rainbow city with tiny people visible in windows. This shows advanced spatial thinking, narrative layering, and emotional investment in imaginary worlds.":
    "זוהר יצרה את היצירה המורכבת ביותר שלה עד כה — עיר קשת עם אנשים זעירים שנראים בחלונות. זה מראה חשיבה מרחבית מתקדמת, שכבות של סיפור, והשקעה רגשית בעולמות דמיוניים.",

  // Mock pipeline default
  "This month showed a wonderful leap in narrative thinking — instead of drawing single subjects, the artwork began telling stories with multiple characters, environments, and implied action. This is a significant developmental milestone.":
    "החודש הראה קפיצה נהדרת בחשיבה נרטיבית — במקום לצייר נושאים בודדים, היצירות החלו לספר סיפורים עם דמויות מרובות, סביבות ופעולות משתמעות. זוהי אבן דרך התפתחותית משמעותית.",
};

// ── Growth tips ────────────────────────────────────────────────────────────────
const GROWTH_TIP_HE: Record<string, string> = {
  "Zohar is a true animal whisperer! Her ability to capture the personality of each creature is remarkable. To stretch this superpower, try an 'Animal Feelings Day' — pick an animal and draw it feeling happy, then sad, then surprised. How does a sad elephant look different from a happy one?":
    "זוהר היא לוחשת לחיות אמיתית! היכולת שלה ללכוד את האישיות של כל יצור מדהימה. כדי להרחיב את כוח-העל הזה, נסו ׳יום רגשות של חיות׳ — בחרו חיה וציירו אותה שמחה, עצובה ומופתעת. איך נראה פיל עצוב לעומת פיל שמח?",

  "Zohar made an incredible leap this month — she drew her very first self-portrait! This shows she's starting to see herself as a character in her own story. Celebrate this by making a 'Family Gallery' together: each family member draws their self-portrait and you hang them all side by side.":
    "זוהר עשתה קפיצה מדהימה החודש — היא ציירה את הדיוקן העצמי הראשון שלה! זה מראה שהיא מתחילה לראות את עצמה כדמות בסיפור שלה. חגגו את זה ביצירת ׳גלריית משפחה׳ ביחד: כל בן משפחה מצייר את הדיוקן שלו ותולים את כולם זה לצד זה.",

  "Zohar is a world-builder! This month she created entire universes — from game arenas to rainbow cities to outer space. To take this even further, try a 'Story in Three Panels' challenge: draw what happened BEFORE the scene, the scene itself, and what happens AFTER. Comics, here we come!":
    "זוהר היא בונת עולמות! החודש היא יצרה יקומים שלמים — מזירות משחק ועד ערי קשת ועד החלל החיצון. כדי לקחת את זה עוד צעד, נסו אתגר ׳סיפור בשלושה פאנלים׳: לצייר מה קרה לפני הסצנה, את הסצנה עצמה, ומה קורה אחרי. קומיקס, אנחנו באים!",

  // Mock defaults
  "Your child is a true animal whisperer — the personality and emotion captured in each creature shows remarkable empathy and observation. To stretch this superpower, try an 'Animal Feelings Day': pick one animal and draw it feeling happy, then scared, then surprised. How does a surprised giraffe look different from a calm one?":
    "הילד/ה שלכם לוחש/ת לחיות אמיתי/ת — האישיות שמועברת בכל יצירה מראה אמפתיה ויכולת תצפית מדהימה. כדי להרחיב את כוח-העל הזה, נסו ׳יום רגשות של חיה׳: בחרו חיה אחת וציירו אותה שמחה, מפוחדת ומופתעת. איך נראית ג׳ירפה מופתעת לעומת רגועה?",

  "Your child has a gift for capturing the people they love — each family member in their drawings has their own look and personality. That's a real artistic skill! To celebrate this, try making a 'Family Portrait Gallery' together: everyone in the family draws their own self-portrait, and you hang them all side by side.":
    "לילד/ה שלכם יש כישרון ללכוד את האנשים שהם אוהבים — לכל בן משפחה ביצירות יש מראה ואישיות משלו. זה כישרון אמנותי אמיתי! כדי לחגוג, נסו ליצור ׳גלריית דיוקנות משפחה׳ ביחד: כל אחד במשפחה מצייר דיוקן עצמי ותולים את כולם זה לצד זה.",

  "Your child is a world-builder — this month they created entire universes full of action, characters, and drama. That's an incredible creative gift! To take it even further, try a 'Story in Three Panels' challenge: draw what happened BEFORE the scene, the scene itself, and what happens AFTER. Comics, here we come!":
    "הילד/ה שלכם בונה עולמות — החודש נוצרו יקומים שלמים מלאים בפעולה, דמויות ודרמה. זו מתנה יצירתית מדהימה! כדי לקחת את זה עוד צעד, נסו אתגר ׳סיפור בשלושה פאנלים׳: ציירו מה קרה לפני, את הסצנה עצמה, ומה קורה אחרי. קומיקס, אנחנו באים!",

  "Your child's imagination reaches all the way to the stars — literally! The space scenes this month show wonderful scientific curiosity mixed with pure creativity. Try a 'Space Mission' drawing challenge: design a spaceship for a specific mission. What does a ship that only travels to ice planets look like?":
    "הדמיון של הילד/ה שלכם מגיע עד הכוכבים — ממש! סצנות החלל החודש מראות סקרנות מדעית נפלאה בשילוב יצירתיות טהורה. נסו אתגר ׳משימת חלל׳: תכננו חללית למשימה ספציפית. איך נראית ספינה שנוסעת רק לכוכבי קרח?",

  "Your child is blossoming into a wonderfully expressive artist — each piece this month showed new confidence and creativity. To celebrate, try a 'Draw What You Hear' challenge: play their favorite song and ask them to draw what the music looks like. There's no wrong answer!":
    "הילד/ה שלכם פורח/ת לאמן/ית ביטויי/ת נפלא/ה — כל יצירה החודש הראתה ביטחון ויצירתיות חדשים. כדי לחגוג, נסו אתגר ׳צייר מה שאתה שומע׳: נגנו שיר אהוב ובקשו מהם לצייר איך המוזיקה נראית. אין תשובה שגויה!",
};

// ── Encouragement scripts ─────────────────────────────────────────────────────
const SCRIPT_HE: Record<string, string> = {
  // January
  "I love how you made the giraffe so tall it almost touched the top of the page — you really understood how big giraffes are!":
    "אני אוהב/ת איך שעשית את הג׳ירפה כל כך גבוהה שהיא כמעט נגעה בקצה הדף — ממש הבנת כמה ג׳ירפות גדולות!",
  "The stripes on your tiger are so perfectly even — you were so patient and careful with every single line.":
    "הפסים של הנמר שלך כל כך אחידים — היית כל כך סבלני/ת וזהיר/ה עם כל קו וקו.",
  "Your flamingo standing on one leg is so elegant! How did you know flamingos do that?":
    "הפלמינגו שלך שעומד על רגל אחת כל כך אלגנטי! איך ידעת שפלמינגו עושים את זה?",

  // February
  "That self-portrait you drew looks so much like you — I could tell it was you right away just from the smile!":
    "הדיוקן העצמי שציירת ממש דומה לך — ידעתי מיד שזה את/ה רק מהחיוך!",
  "I love how you drew mom with flowers all around her. Those petals are so detailed — how long did that take you?":
    "אני אוהב/ת איך ציירת את אמא עם פרחים סביבה. עלי הכותרת כל כך מפורטים — כמה זמן לקח לך?",
  "Your robot is amazing — I love that you put numbers on the buttons. That's such a smart idea!":
    "הרובוט שלך מדהים — אני אוהב/ת שהוספת מספרים על הכפתורים. איזה רעיון חכם!",

  // March
  "That rainbow city with the tiny people in the windows is incredible — I want to live there! Did you name the city?":
    "עיר הקשת עם האנשים הקטנים בחלונות מדהימה — אני רוצה לגור שם! נתת שם לעיר?",
  "I noticed how you drew the basketball player in mid-jump — how did you know how to show someone moving?":
    "שמתי לב איך ציירת את שחקן הכדורסל באמצע קפיצה — איך ידעת להראות מישהו בתנועה?",
  "The mermaid's individual scales must have taken so long — that kind of patience shows what a dedicated artist you are.":
    "הקשקשים של בת הים בטח לקחו המון זמן — הסבלנות הזו מראה איזו אמנית מסורה את.",

  // Mock defaults (from generateEncouragement.ts)
  "I love how you made the tiger's stripes so perfectly even — you were so patient and careful with every single line.":
    "אני אוהב/ת כמה שהפסים של הנמר שלך אחידים — היית כל כך סבלני/ת וזהיר/ה עם כל קו.",
  "Your whale looks like it could actually splash water! How did you make it look so real?":
    "הלוויתן שלך נראה כאילו הוא יכול ממש להתיז מים! איך גרמת לו להיראות כל כך אמיתי?",
  "I can tell you really looked at the flamingo and thought about how it stands. That's what real artists do.":
    "אני רואה שממש הסתכלת על הפלמינגו וחשבת על איך הוא עומד. זה מה שאמנים אמיתיים עושים.",
  "That self-portrait looks so much like you — I could tell it was you right away just from your smile!":
    "הדיוקן העצמי שלך כל כך דומה לך — ידעתי מיד שזה את/ה רק מהחיוך!",
  "I love how you drew everyone in our family with something special about them. You really see us.":
    "אני אוהב/ת איך ציירת כל אחד במשפחה עם משהו מיוחד. את/ה ממש רואה אותנו.",
  "The way you drew mom with all those flowers around her — she's going to love it when she sees it.":
    "הדרך שציירת את אמא עם כל הפרחים סביבה — היא הולכת לאהוב את זה כשתראה.",
  "I noticed how you drew the character in mid-jump — how did you figure out how to show someone moving?":
    "שמתי לב איך ציירת את הדמות באמצע קפיצה — איך הבנת איך להראות מישהו בתנועה?",
  "That arena scene has so many characters and so much happening — I could look at it for hours and keep finding new things.":
    "בסצנת הזירה יש כל כך הרבה דמויות וכל כך הרבה קורה — אפשר להסתכל על זה שעות ולמצוא דברים חדשים.",
  "The way you thought about what each character looks like shows you really know them. That's what great storytellers do.":
    "הדרך שחשבת איך כל דמות נראית מראה שאת/ה ממש מכיר/ה אותם. זה מה שמספרי סיפורים גדולים עושים.",
  "I love how much color you used — it feels like the picture is full of energy, just like you.":
    "אני אוהב/ת כמה צבע השתמשת — זה מרגיש כאילו התמונה מלאה באנרגיה, בדיוק כמוך.",
  "You spent so much time on this — I could see you really thinking about what you wanted to draw.":
    "השקעת כל כך הרבה זמן בזה — ראיתי אותך ממש חושב/ת על מה שרצית לצייר.",
  "I notice you always try new things in your drawings. That bravery is what makes you a great artist.":
    "אני שם/ה לב שאת/ה תמיד מנסה דברים חדשים ביצירות. האומץ הזה הוא מה שהופך אותך לאמן/ית נהדר/ת.",
  "I love that your astronaut looks like they're floating — you really thought about what it feels like in space, not just what it looks like.":
    "אני אוהב/ת שהאסטרונאוט שלך נראה כאילו הוא מרחף — ממש חשבת איך מרגיש בחלל, לא רק איך זה נראה.",
  "The way you drew Saturn with its rings so carefully — did you look at a picture, or did you just know?":
    "הדרך שציירת את שבתאי עם הטבעות כל כך בזהירות — הסתכלת בתמונה, או שפשוט ידעת?",
  "That rocket has so many details on it. I can tell you really thought about how it would actually work.":
    "לרקטה שלך יש כל כך הרבה פרטים. אני רואה שממש חשבת איך היא תעבוד באמת.",
};

// ── Public helpers ─────────────────────────────────────────────────────────────

export function translateMilestone(text: string, locale: string): string {
  if (locale !== "he") return text;
  return MILESTONE_HE[text] ?? text;
}

export function translateGrowthTip(text: string, locale: string): string {
  if (locale !== "he") return text;
  return GROWTH_TIP_HE[text] ?? text;
}

export function translateScript(text: string, locale: string): string {
  if (locale !== "he") return text;
  return SCRIPT_HE[text] ?? text;
}
