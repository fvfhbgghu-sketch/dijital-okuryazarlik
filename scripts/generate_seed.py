# -*- coding: utf-8 -*-
"""
Generates supabase/seed.sql from the structured question banks.
Run:  python scripts/generate_seed.py
Deterministic UUIDs (uuid5) make the seed idempotent (ON CONFLICT DO NOTHING).
"""
import uuid, os, io

NS = uuid.UUID("8f6b2c14-2c1a-4f5e-9b7a-0d2f9c3e4a10")  # fixed project namespace

def uid(*parts):
    return str(uuid.uuid5(NS, "|".join(str(p) for p in parts)))

# --- Exam definitions -------------------------------------------------------
EXAM1 = {
    "id": uid("exam", "final-onceki"),
    "slug": "final-onceki-yillar",
    "title": "Dijital Okuryazarlık — Final & Önceki Yıllar",
    "description": "Final 2022-2023 ve önceki yıllarda çıkmış sorular (tekrarsız).",
}
EXAM2 = {
    "id": uid("exam", "bolum-sonu"),
    "slug": "bolum-sonu-sorulari",
    "title": "Dijital Okuryazarlık — Bölüm Sonu Soruları",
    "description": "Anadolu Üniversitesi AÖF kitabı 'Neler Öğrendik?' bölüm sonu soruları (8 bölüm).",
}

LETTERS = ["A", "B", "C", "D", "E", "F"]

def Q(text, options, correct):
    """options: list of strings (A,B,C..). correct: 0-based index."""
    return {"text": text, "options": options, "correct": correct}

# --- EXAM 1 : 29 questions --------------------------------------------------
exam1 = [
 Q("Aşağıdakilerden hangisi tablet kullanırken genelde kullandığımız özelliklerden biri değildir?",
   ["Her ortama taşıyabilmek","Uygulamaları tablete indirip kullanmak","İnternet bağlantısı","Fiziksel klavye","Ekran etkileşimi"], 3),
 Q("Etik davranış sergileyen dijital okuryazar bir bireyden aşağıdaki davranışlardan hangileri beklenmektedir?\n1. Dijital araçları sorumluluk bilinciyle kullanır.\n2. Teknolojiyi ve dijital araçları doğru kullanır.\n3. Zorbalık, nefret söylemi ve kişisel hakaret faaliyetlerinin çevrimiçi ortamda yayılmasını destekler.\n4. İnternet kullanımıyla ilgili kurallar belirler, zaman sınırlaması yapar.\n5. Dijital araçları güvenlik hissiyatıyla tüketir.",
   ["3, 4 ve 5","1, 2, 4 ve 5","2 ve 3","1, 2 ve 3","Hepsi"], 1),
 Q("Dijital Çağ'da 1980'den sonra doğan bireyleri tanımlamak için kullanılan kavram aşağıdakilerden hangisidir?",
   ["Dijital Yerli","Postmodern","Dijital Göçmen","Distopyan","Ütopyan"], 0),
 Q("Aşağıdakilerden hangisi günümüzde geleneksel teknolojiler olarak değerlendirilemez?",
   ["Bulut Bilişim","Müzik Setleri","İnternet erişimi olmayan hücresel telefonlar","Radyo","Kablolu Telefonlar"], 0),
 Q("Aşağıdakilerden hangisi, sosyal ağ uygulamalarının genel özelliklerinden biri değildir?",
   ["Kullanıcıların profil yaratmaları","Etiketler ile yorum yapılması","Üyelik için diğer kullanıcılardan davet gerekmesi","Diğer kullanıcılar ile bağlantı kurulması","Sanal topluluk ve grupların oluşması"], 2),
 Q("Aşağıdakilerden hangileri bulut bilişimin genel özelliklerindendir?\n1. Geniş ağ erişimi\n2. Ölçülebilir hizmet\n3. Kaynak havuzu\n4. Çabukluk ve esneklik\n5. Kendi kendine hizmet",
   ["1, 2 ve 3","1 ve 2","3, 4 ve 5","1, 4 ve 5","Hepsi"], 4),
 Q("Aşağıdakilerden hangisi sınırdaki teknolojiler içerisinde yer alamaz?",
   ["Bilgisayarla Görü","İnsansız Araçlar","Dijital Koku Teknolojisi","Giyilebilir Bilgisayarlar","Akıllı Kişisel Yardımcılar"], 0),
 Q("Aşağıdakilerden hangisi, sosyal medya platformlarında elektronik ticaretle ilgili bir kullanımdır?",
   ["Ders etkinlikleri için grup oluşturma","İş ilanına başvurma","Tanıdıklara ürün tavsiye etme","Ortak ilgi alanına sahip kişilerle haberleşme","Sosyal organizasyonları takip etme"], 2),
 Q("İnternet üzerinde bir hizmet olarak sanallaştırılmış, ölçeklendirilebilir kaynakları ifade eden bilişim sistemi aşağıdakilerden hangisidir?",
   ["Bilgi sistemleri","Bulut bilişim","Karar destek sistemleri","Yönetim bilişim sistemleri","Hiçbiri"], 1),
 Q("YouTube'da aşağıdakilerden hangisini siteye üye olmadan yapabilirsiniz?",
   ["Yayınlanan videolara yorum yap","Video oluşturmak","Video izlemek","Kendine ait kanal oluşturmak","Video yüklemek"], 2),
 Q("İnsanlık tarihinde gerçekleşen gelişmelerden hangisi diğerlerinden önce gerçekleşmiştir?",
   ["Barınak inşa edilmesi","Tarım yapılması","Hayvanların evcilleştirilmesi","Çevredeki yiyeceklerin toplanması","Hayvancılık yapılması"], 3),
 Q("Bulut bilişimin çok sayıda faydası bulunduğu bilinmekte ancak bunun yanında bazı sınırlılıkları mevcuttur. Aşağıdakilerden hangisi bulut bilişimin sınırlılığıdır?",
   ["Çevre birimleri","Güvenlik","Maliyet","Yasal sorunlar","Hepsi"], 4),
 Q("İnsanlık tarihi süreçlerinde baskın olan olgu ile toplum türleri isimlendirilmiştir. Aşağıdakilerden hangisi bu toplum türlerinden biri değildir?",
   ["Sanayi toplumu","Tarım toplumu","Avcı-toplayıcı toplum","Ekonomik toplum","Bilgi toplumu"], 3),
 Q("1. İşbölümünün yaygınlaşması\n2. Seri üretime geçilmesi\n3. Standartlaşmanın gerçekleşmesi\nYukarıdakilerin hangisi/leri sanayi devriminin sonuçlarındandır?",
   ["Yalnız 1","2 ve 3","Yalnız 2","1 ve 2","Hepsi"], 4),
 Q("Bilinçli bir dijital okuryazarlık kültürünün oluşumunu şekillendiren en temel hususlardan biri ........ dır.",
   ["eleştirel düşünme","yazılım geliştirmek","okuma alışkanlığı","verimli çalışmak","hiçbiri"], 0),
 Q("Aşağıdaki araçlardan hangisi giyilebilir teknoloji kategorisindedir?",
   ["Dizüstü bilgisayarlar","Tablet bilgisayarlar","Akıllı gözlükler","Şarj edilebilir bataryalar","Akıllı telefonlar"], 2),
 Q("Aşağıdakilerden hangisi bulut bilişim hizmetlerinden biri değildir?",
   ["Altyapı hizmeti","Planlama hizmeti","Veri tabanı hizmeti","Depolama hizmeti","Yazılım hizmeti"], 1),
 Q("Aşağıdakilerden hangisi \"Kitlesel Açık Çevrim içi Ders\"lerin sağladığı temel faydalardan biri değildir?",
   ["İçeriğin katılımcılar tarafından paylaşılabilir olması","Yaşam boyu öğrenme becerilerini geliştirmesi","Zaman ve mekân sınırlaması olmaması","Daha fazla kişiye ulaşarak kullanımını yaygınlaştırması","Tamamen ücretli olması"], 4),
 Q("Bilgi toplumuna geçişte aşağıdakilerden hangisinin etkisi daha büyük olmuştur?",
   ["Üretimin artması","Merkezi bölgelere göçün artması","Tüketimin artması","Dijital teknolojilerdeki gelişmeler","Yaşam süresinin uzaması"], 3),
 Q("Aşağıdaki araçlardan hangisi taşınabilir bir teknoloji değildir?",
   ["akıllı saat","tablet","masaüstü bilgisayar","mobil telefon","dizüstü bilgisayar"], 2),
 Q("Kitlesel Açık Çevrim İçi Ders uygulamalarında derslerin dijital araçların yardımıyla ağlar üzerinden yürütülmesini ifade eden kavram aşağıdakilerden hangisidir?",
   ["Kitlesellik","Açıklık","Geleneksellik","Ders","Çevrimiçi"], 4),
 Q("ABD Ulusal Standartlar ve Teknoloji Enstitüsü tarafından dört bulut yayılım türü tanımlanmıştır. Aşağıdakilerden hangisi bulut yayılım türü değildir?",
   ["Topluluk bulutu","Güvenlik bulutu","Kamu bulutu","Melez bulut","Özel bulut"], 1),
 Q("1. Yaşamboyu öğrenmede kontrol kurumların elinde olmalıdır.\n2. Hangi yaşta olursa olsun insanlara öğrenme fırsatlarının sunulmasını kapsar.\n3. Yaşamboyu öğrenmede bireylerin bilinçli, gönüllü ve kendini güdülemesi esastır.\nYaşamboyu öğrenmeye yönelik ifadelerden hangileri doğrudur?",
   ["1 ve 3","Yalnız 2","Yalnız 1","2 ve 3","Hepsi"], 3),
 Q("Aşağıdakilerden hangisi \"nomofobi\"ye en yakın anlamı verir?",
   ["Tabletimi kullanırken pek rahat değilim","Akıllı saatimi tam kapasite kullanamıyorum","Telefonumu evde unutmuşum çok rahatsızım, hiç huzurum yok.","Telefonda başkalarıyla rahat konuşamıyorum","Dizüstü bilgisayarımın belleği çok yetersiz"], 2),
 Q("Günümüzde, yaşamboyu öğrenme bireysel bir istek olmanın ötesinde bir gereklilik haline gelmiştir. Bu durumun temelinde yatan sebep nedir?",
   ["Eğitim süresinin yetersiz olması","Eğitimin her yaştaki insan için ihtiyaç olması","Eğitimin okul sınırları içinde sınırlandırılmasının yanlışlığı","Yaşamın her alanında ve teknolojide meydana gelen değişimlerin boyutu ve hızı","Eğitimlerin esnek olması"], 3),
 Q("Aşağıdakilerden hangileri eleştirel düşünmenin temellerindendir?\n1. Farklı argümanların ele alınması\n2. Kararların ve açıklamaların işlenmesi, analizi ve üretilmesi\n3. Fikir ve ifadelerin yorumlanması, açıklanması\n4. Çıkarımlar yapılması",
   ["1, 2 ve 3","1, 3 ve 4","Yalnız 1","Yalnız 3","Hepsi"], 4),
 Q("Aşağıdakilerden hangisi taşınabilir teknolojilerle ilgili bir bilgi değildir?",
   ["Giyilebilir teknolojiler","Şarj edilebilir batarya","Gittiğimiz her ortama taşıyabilmek","3D yazıcılarla birçok nesneyi oluşturmak","Kablosuz internet bağlantısına sahip olmak"], 3),
 Q("Çevrim içi ortamların yoğun kullanımıyla birlikte hakaret içerikli, provokatif, yanıltıcı iletilerin artması; farklı kullanıcıları amaçlı olarak olumsuz açıdan etkileyip duygusal tepkiler vermeleri yönünde kışkırtmak anlamına gelen kavram aşağıdakilerden hangisidir?",
   ["Troll","Sanal ortam","Fenomen","Kullanıcı","Sosyal medya"], 0),
 Q("Aşağıdakilerden hangisi sosyal medyayı kullanmak için mutlaka gereklidir?",
   ["Medya okuryazarlığı becerilerine sahip olmak","İnternet erişimine sahip olmak","Siteden davet gelmesi","İletişim bilgisi olarak telefon numarası vermek"], 1),
]

# --- EXAM 2 : 80 questions (Bölüm Sonu) ------------------------------------
exam2 = [
 # Bölüm 1
 Q("İnternet üzerinde web sayfası oluşturmak için kullanılan betik dil aşağıdakilerden hangisidir?",
   ["ftp","http","www","URL","html"], 4),
 Q("Aşağıdakilerden hangisi Internet veri transferi protokollerinden biri değildir?",
   ["ftp","http","mailto","Web","https"], 3),
 Q("\"https://giris.turkiye.gov.tr/Giris/e-Devlet-Sifresi\" URL adresinin alan adı aşağıdakilerden hangisidir?",
   ["https://","turkiye.gov.tr","https://giris.turkiye.gov.tr","giris.turkiye.gov.tr","https://giris.turkiye.gov.tr/Giris"], 1),
 Q("İçerisinde Açıköğretim Fakültesi ifadesinin aynen geçtiği Web sayfalarını bulmak için arama motorunda kullanılması gereken sorgulama ifadesi aşağıdakilerden hangisidir?",
   ["Açıköğretim*Fakültesi","Açıköğretim+Fakültesi","\"Açıköğretim Fakültesi\"","Açıköğretim AND Fakültesi","Açıköğretim Fakültesi"], 2),
 Q("Aşağıdaki web tarayıcılarından hangisi açık kaynak kodludur?",
   ["Mozilla Firefox","Google Chrome","Windows Internet Explorer","Safari","Yandex"], 0),
 Q("TR-NET'in 1992 yılında gerçekleştirdiği ilk deneysel çalışmalar hangi ülkeye yapılmıştır?",
   ["Fransa","Hollanda","İngiltere","Almanya","Yunanistan"], 1),
 Q("Türkiye'de ilk İnternet bağlantısı ne zaman gerçekleştirilmiştir?",
   ["1986","1987","1990","1991","1993"], 4),
 Q("Küresel ve yerel özellikleri birleştirerek coğrafi konum bazlı ve kişiselleştirilebilen uygulamalar konusunda öne çıkan arama motoru aşağıdakilerden hangisidir?",
   ["Google","Bing","Yahoo","Yandex","Google Akademik"], 3),
 Q("Aşağıdakilerden hangisi Google Akademik arama motoru özelliklerinden biri değildir?",
   ["Farklı kaynaklara arama","Bilimsel yazıları, özetleri ve alıntıları bulma","En çok beğenilen görselleri arama","Herhangi bir konu hakkında bilimsel yazılardan bilgi edinme","Kütüphane yardımı yoluyla yazıların tamamına erişme"], 2),
 Q("Aşağıdakilerden hangisi dünyada e-Devlet uygulamalarının kullanım amaçları arasında yer almaz?",
   ["Statüye göre kaynak kullanımını denetleme","Demokrasi bilincinin kazandırılması","Hükümete güven ve bağlılığın artırılması","Şeffaflığın sağlanması","Maliyetlerin düşürülmesi"], 0),
 # Bölüm 2
 Q("Aşağıdakilerden hangisi taşınabilir teknolojiler için hem avantaj hem de dezavantaj olarak görülebilir?",
   ["Her yerde kullanabilme esnekliği","Çokluortam kullanımı","Kişiselleştirme özelliği","Şarj edilebilir bataryalar","Uzun süre kullanmaya bağlı sorunlar"], 3),
 Q("Aşağıdakilerden hangisi giyilebilir teknoloji olarak değerlendirilebilir?",
   ["Tablet bilgisayarlar","Akıllı gözlükler","Akıllı telefonlar","Dizüstü bilgisayarlar","Şarj edilebilir bataryalar"], 1),
 Q("Aşağıdakilerden hangisi taşınabilir teknolojilerden biri değildir?",
   ["Masaüstü bilgisayar","Akıllı telefon","Dizüstü bilgisayar","Tablet bilgisayar","Akıllı saat"], 0),
 Q("Birçok kullanıcı tarafından dizüstü bilgisayar yerine kullanılan isim aşağıdakilerden hangisidir?",
   ["Netbook","Tablet","Notebook","Slate","Masaüstü"], 2),
 Q("Aşağıdakilerden hangisi taşınabilir teknolojilerin günümüzde en son geldiği noktayı temsil eder?",
   ["Her ortamda kullanılabilme","Sosyal medya paylaşımları","Kablosuz internet erişimi","Şarj edilebilir batarya","Giyilebilir teknolojiler"], 4),
 Q("Aşağıdakilerden hangisi \"nomofobi\"yi en iyi tanımlar?",
   ["Telefonum yanımda değil ve ben huzursuzum","Telefonda diğer insanlarla rahat konuşamıyorum","Tablet bilgisayarımı kullanırken rahat değilim","Dizüstü bilgisayarımın belleği çok yetersiz","Akıllı saatimi tüm özellikleri ile kullanamıyorum"], 0),
 Q("Taşınabilir teknolojinin gelişimini en iyi ifade eden sıralama aşağıdakilerden hangisidir?",
   ["Masaüstü PC-Dizüstü PC-Akıllı Telefon-Şarj edilebilir batarya-Kamera","Akıllı saat-Tablet-Mobil Telefon-Dizüstü PC-Masaüstü PC","3D yazıcı-E-Posta-Sosyal ağlar-SMS ve MMS-Video görüşme","Nesnelerin interneti-Artırılmış gerçeklik-Navigasyon-Ses tanıma-ADSL","Masaüstü PC-Mobil Telefon-Dizüstü PC-Tablet-Akıllı saat"], 0),
 Q("Araştırmalara göre ülkemizde akıllı telefonların en yoğun kullanıldığı alan aşağıdakilerden hangisidir?",
   ["Haber okumak","Arama yapmak","Oyun oynamak","Sosyal ağlara girmek","Yol tarifi için kullanmak"], 3),
 Q("Taşınabilir teknolojilerin aynı anda ses, grafik ve video paylaşabilmesini sağlayan teknoloji aşağıdakilerden hangisidir?",
   ["GPRS","EDGE","3G","GSM","GPS"], 2),
 Q("Aşağıdakilerden hangisi tam ekran tablet bilgisayarlarda görmeye alışık olmadığımız özelliklerden biridir?",
   ["İnternet erişimi","Fiziksel klavye","Çokluortam uygulamaları","Kompakt yapı","Ekran etkileşimi"], 1),
 # Bölüm 3
 Q("Ağ toplumu yaklaşımına göre, toplumları dönüştüren temel belirleyiciler aşağıdakilerden hangileridir?",
   ["Bilgisayar teknolojileri ve enformasyon akışı","Ekonomi ve üretim","Askeri teknolojiler","Endüstriyel gelişme ve sanayi","Sosyokültürel değerler"], 0),
 Q("İnternetin sosyal etkileşim olanaklarının kullanıldığı Web 2.0 araçlarının genel adı aşağıdakilerden hangisidir?",
   ["Sosyal paylaşım","Sosyal medya","Sosyal ağlar","Bloglar","Forumlar"], 1),
 Q("Aşağıdakilerden hangisi, sosyal ağ sitelerinin genel özelliklerinden biri değildir?",
   ["Kullanıcıların profil yaratmaları","Diğer kullanıcılar ile bağlantı kurulması","Etiketler ile yorum yapılması","Üyelik için diğer kullanıcılardan davet gerekmesi","Sanal topluluk ve grupların oluşması"], 3),
 Q("Aşağıdakilerden hangisi, sosyal ağ sitelerinin elektronik ticarete yönelik kullanımına örnektir?",
   ["Ders etkinlikleri için grup oluşturma","Ortak ilgi alanına sahip kişilerle haberleşme","Sosyal organizasyonları takip etme","İş ilanına başvurma","Tanıdıklara ürün tavsiye etme"], 4),
 Q("Sosyal ağların kullanım alanlarının çeşitlenmesinin temel nedeni aşağıdakilerden hangisidir?",
   ["Elektronik ticaretin yaygınlaşması","Ağlardaki kullanıcı sayısının artma eğilimi","Bilgi iletişim teknolojilerinin gelişmesi","Sanal toplulukların oluşması","İnternet trafiğinin izlenmesi"], 2),
 Q("Aşağıdakilerden hangisi sosyal ağ sitelerini kullanmak için mutlaka gereklidir?",
   ["İnternet erişimine sahip olmak","Ücret ödemek","Siteden davet gelmesi","İletişim bilgisi olarak telefon numarası vermek","Medya okuryazarlığı becerilerine sahip olmak"], 0),
 Q("Facebook'ta faaliyet alanı ile ilgili tanıtım yapmak isteyen bir şirket için en uygun eylem aşağıdakilerden hangisidir?",
   ["Bireysel hesap açmak","Herkese açık grup açarak etkinlik düzenlemek","Kapalı grup açmak","Sadece kendi personelinin yer aldığı bir gizli grup açmak","Şirkete ait bir sayfa oluşturmak"], 4),
 Q("LinkedIn'deki onaylama sistemi nedir?",
   ["Kullanıcının iş başvurusunun olumlu sonuçlanması","Kullanıcının yetenek, beceri ve deneyimlerinin bağlantıda olduğu kişilerce geçerlenmesi","Kullanıcı hakkında olumlu tavsiye mektubu yazılması","Kullanıcının yaptığı paylaşımların beğenilmesi","Kullanıcının paylaşımlarının başkaları tarafından da paylaşılması"], 1),
 Q("YouTube'da aşağıdakilerden hangisini yapmak için siteye üye olmak gerekmez?",
   ["Video oluşturmak","Video yüklemek","Video izlemek","Yayınlanan videolara yorum yapmak","Kendine ait kanal oluşturmak"], 2),
 Q("Medya okuryazarlığına ilişkin iki temel unsur hangileridir?",
   ["İçerik üretme yeterliliği – Veri madenciliği","Bağlantı kurma yeteneği – Paylaşım sayısının miktarı","İnterneti kullanma deneyimi - Mesajı uygun ortamda sunabilme yeterliliği","Teknolojiyi kullanma becerisi – İnterneti kullanma deneyimi","Teknolojiyi kullanma becerisi - İçeriği değerlendirebilme yeteneği"], 4),
 # Bölüm 4
 Q("İnsanlığın teknolojik evrimi göz önüne alındığında kullandıkları ilk alet aşağıdakilerden hangisini sağlamaya yöneliktir?",
   ["Diğer insanlardan korunmak","Barınak inşa etmek","Yiyecek aramak ve yırtıcı hayvanlardan korunmak","Tarımsal üretime geçmek","Hayvancılık yapmak"], 2),
 Q("Aşağıdakilerden hangisi tarihsel süreç içerisinde var olan toplum türlerinden biri değildir?",
   ["Avcı-toplayıcı toplum","Ekonomik toplum","Tarım toplumu","Sanayi toplumu","Bilgi toplumu"], 1),
 Q("Çömlekçilik temel olarak aşağıdaki gereksinimlerden hangisini karşılamaya yönelik ortaya çıkmıştır?",
   ["Yapıların süslenmesi","Tahılların samandan ayrılması","Tahılların sınıflanması","Tahılların harmanlanması","Ürünlerin saklanması ve taşınması"], 4),
 Q("Aşağıdakilerden hangisi sanayi devriminin sonuçlarından biri değildir?",
   ["İşbölümünün yaygınlaşması","Üretimde standartlaşma olması","Sınıf kavgalarının azalması","Ailelerin üretim merkezi olmaktan çıkması","Kentlere göçün artması"], 2),
 Q("Bilgi toplumuna geçişte en önemli etken aşağıdakilerden hangisidir?",
   ["Üretimde ve tüketimde kitlesellik","Eğitimde standartlaşma","Kentlere göçün artması","Elektronik teknolojisindeki büyük atılımlar","Sağlık hizmetlerinin yaygınlaşması"], 3),
 Q("Aşağıdakilerden hangisi teknolojik gelişmelerin olumsuz etkilerinden biri değildir?",
   ["Sosyal ilişkilerin artması","Çevre kirliliğinin artması","İnsan sağlığının olumsuz etkilenmesi","Makineleşmeyle birlikte işsizliğin artması","Tarımın modernleşmesiyle toprağın fakirleşmesi"], 0),
 Q("Teknolojinin toplum veya birey üzerinde etkisi olmadığı ve teknolojinin etkisinin kullanıcılar tarafından belirlendiği görüşünü içeren yaklaşım aşağıdakilerden hangisidir?",
   ["Ağ toplumu","Sosyal belirlenimcilik","Teknolojik belirlenimcilik","Kullanıma odaklanan belirlenimcilik","Ütopyan bakış açısı"], 3),
 Q("Aşağıdakilerden hangisi teknolojik gelişmelerin toplumu olumsuz etkilediğini savunan düşünürlerin bakış açısını ifade eder?",
   ["Ütopyan","Distopyan","Postmodern","Dijital yerli","Dijital göçebe"], 1),
 Q("Yeterli sayıda insanın, insani duygularla siber alanda kişiler arası ağ kurmak üzere kamusal tartışmalara yeterince uzun bir süre katılmasıyla ağ içerisinde oluşturdukları toplumsal kümelenmelere ne ad verilir?",
   ["Sanal topluluk","Bilgi toplumu","İşbirliği halindeki topluluklar","Ağ toplumu","Dijital topluluk"], 0),
 Q("Aşağıdakilerden hangisi çevrimiçi ortamlarda bireylerin kendini sunma yöntemlerinden biridir?",
   ["Ağlarda gezinme","Video çekimi","Sanal iletişim","Topluluk oluşturma","Özçekim"], 4),
 # Bölüm 5
 Q("Aşağıdakilerden hangisi Bilgisayar Etik Enstitüsü tarafından geliştirilen ve bilgisayar kullanım konusunda etik ilkelerinin temelini oluşturan ilkelerden biri değildir?",
   ["Bilgisayar hırsızlık yapmak için kullanılamaz.","Kişi yazdığı programın sosyal hayata etkilerini dikkate almalıdır.","Başka insanların bilgisayar çalışmaları karıştırılamaz.","Bilgisayar yalan bilgiyi yaymak için kullanılamaz.","Bilgisayar insanlara kar getirecek işlerde kullanılamaz."], 4),
 Q("Aşağıdaki CC lisanslarından hangisi eserin ilk sahibinin belirtilmesi ve özgün halinin korunması gerektiği anlamına gelir?",
   ["CC BY-ND","CC BY-NC","CC BY-NC-ND","CC BY","Public Domain / CC0"], 0),
 Q("Aşağıdakilerden hangisi İnternette kaynak göstermeden yapılan intihal türüne bir örnektir?",
   ["Mükemmel suç","Hayalet yazar","Yanlış Bilgilendirme","Fazla Mükemmel Alıntı","Becerikli Atıf Yapma"], 1),
 Q("Bilişim alanındaki suçlarla ilgili olarak Avrupa Birliği uyum yasaları çerçevesinde hazırlanan 5237 sayılı Türk Ceza Kanunu hangi tarihte yürürlüğe girmiştir?",
   ["1 Ocak 2004","31 Aralık 2014","1 Haziran 2005","15 Ocak 2015","10 Şubat 2012"], 2),
 Q("Ulusal Açık Ders Malzemeleri (UADM) adıyla başlatılan proje hangi kurum tarafından başlatılmıştır?",
   ["Türk Sanayicileri ve İşadamları Derneği (TÜSİAD)","Türkiye Bilimsel ve Teknolojik Araştırma Kurumu (TÜBİTAK)","Yükseköğretim Kurulu (YÖK)","Türkiye Bilimler Akademisi (TÜBA)","Massachusetts Institute of Technology (MIT)"], 3),
 Q("Aşağıdakilerden hangisi İnternette etik dışı davranışların / intihallerin nedenleri arasında değildir?",
   ["Sosyal hayatın yoğunluğu","Etik dışı davranışlarla ilgili bilgisizlik","Bilgi hırsı","Yetersiz ceza","Zamansızlık"], 2),
 Q("Aşağıdakilerden hangisi İnternette kaynak göstererek yapılan intihal türüne bir örnektir?",
   ["Mükemmel Suç","Kendinden Aşırma","Fotokopi","Emek Tembelliği","Mevcut yazı"], 0),
 Q("\"Bir eylemi iyi ya da kötü kılan şey eylemin sonucu veya sonuçlarıdır.\" Bu ifadedeki anlayış hangi etik kurama aittir?",
   ["Deontoloji","Kantçılık","Sonuçsal olmayan","Teoloji","Yeni Kantçılık"], 3),
 Q("Bilişim dünyasında eylemlerin standartlarını ve çerçevelerini inceleyen etik yaklaşımı hangisidir?",
   ["Uygulamalı","Meta-etik","Deontoloji","Faydacılık","Normatif"], 4),
 Q("Başkalarına karşı saygı, altyapı ve zamanı verimli kullanma, biçimsel ve içerik ile ilgili özen ve diğer konular başlıkları altında İnternette iletişim ve etik kurallarını hangi kurum ortaya koymuştur?",
   ["Türkiye Bilişim Vakfı","Türkiye Bilimler Akademisi","Türkiye Bilişim Enstitüsü","Türkiye Bilişim Derneği","Yükseköğretim Kurulu"], 0),
 # Bölüm 6
 Q("Yaşamboyu öğrenme ile ilgili aşağıdakilerden hangisi söylenemez?",
   ["Yaşamboyu öğrenme, kontrolün kurum değil bireyin elinde olduğu bir öğrenme anlayışıdır.","Yaşamboyu öğrenme, işbaşında eğitimi ifade eder.","Yaşamboyu öğrenme, bireyin yaşamı boyunca kazandığı tüm öğrenmelerini içeren bir süreçtir.","Yaşamboyu öğrenme, öğrenme olanaklarının yaşamın tümüne yayılmasına vurgu yapar.","Yaşamboyu öğrenme, öğrenme sürecinde bireylerin bilinçli, gönüllü ve kendini güdülemesi temeli üzerine kuruludur."], 1),
 Q("Aşağıdakilerden hangisi yaşamboyu öğrenme konusunda gerçekleştirilen uygulama şekillerinden biri değildir?",
   ["Kişisel gelişim","Planlı gelişim","Raslantıya bağlı gelişim","Akademik gelişim","Deneyime dayalı gelişim"], 3),
 Q("Aşağıdakilerden hangisi yaşam boyu öğrenme sürecini, geleneksel öğrenme sürecinden ayıran özelliklerden biri değildir?",
   ["Öğrenenin merkezde olması","Bireylerin sahip olduğu yetenekleri geliştirerek en üst düzeye çıkarmayı hedeflemesi","Yapılandırılmıştan yapılandırılmamışa bütün öğrenme biçimlerini kapsaması","Okulun öğrenme için bir zorunluluk olması","Eğitim politikasını kişisel, sosyal, kültürel ve mesleki kazanımlar yanında ülkesine kazanımlar sağlayacak şekilde oluşturması"], 3),
 Q("Aşağıdakilerden hangisi Uluslararası Eğitimi Geliştirme Komisyonu tarafından yaşamboyu öğrenmenin gerekliliğine işaret eden önerilerden biri değildir?",
   ["Eğitimi okul yaşı ve binaları ile sınırlamak yanlıştır.","Eğitim, hem okul içinde hem de okul dışında gerçekleşen etkinlikler bütünü olarak düşünülmelidir.","Eğitsel etkinlikler daha esnek olmalıdır.","Eğitim, yaşam kadar uzun bir varoluşsal süreklilik olarak tasarlanmalıdır.","Eğitimin etkililiği öğretici rehberliğinde, yapılandırılmış bir yapıda sunulmasını gerektirir."], 4),
 Q("Yetişkin eğitiminden söz edebilmek için yetişkin olarak adlandırılan bireylerin sahip olması gereken bazı özellikler vardır. Aşağıdakilerden hangisi bu özelliklerden biri değildir?",
   ["Psikolojik desteğe ihtiyaç duyması","Kendini doğru olarak algılaması","Öğrenme yöneliminin olması","Deneyimlerinin olması","Öğrenmeye hazır olması"], 0),
 Q("KAÇD uygulamalarında, bilgiyi talep eden bireyler ve bilgi kaynakları arasında sınırların ortadan kalktığı öğrenme yapısını ifade eden kavram aşağıdakilerden hangisidir?",
   ["Çevrimiçi","Kitlesellik","Açıklık","Ders","Geleneksellik"], 2),
 Q("Aşağıdakilerden hangisi KAÇD uygulamalarının amaçlarından biri değildir?",
   ["Daha fazla kişiye ulaşmak ve kullanımını yaygınlaştırmak","Marka oluşturup devamlılığı sağlamak","Eğitim çıktılarını artırmak","Eğitim ve öğretime yenilik getirmek","Geleneksel eğitimi ortadan kaldırmak"], 4),
 Q("Aşağıdakilerden hangisi kitlesel çevrimiçi dersleri geleneksel sistemdeki derslerden ayıran özelliklerden biri değildir?",
   ["Davranışçı öğrenmeye dayalı uygulamalar","Akran ve kendi kendini değerlendirme uygulamaları","Çevrimiçi forumlar ve tartışma grupları","Tam öğrenmeye dayalı uygulamalar","Çevrimiçi öğrenme etkinlikleri"], 0),
 Q("George Siemens ve Stephen Downes'ın KAÇD uygulaması aşağıdaki kuramlardan hangisi üzerine kurulmuştur?",
   ["Bilişsel","Duyuşsal","Davranışçı","Bağlantıcı","Yapıcı"], 3),
 Q("Aşağıdakilerden hangisi 21. yy. yaşamboyu öğrenme çerçevesinde yer alan temel stratejilerden biri değildir?",
   ["Herkes için temel beceriler","İnsan kaynaklarına daha fazla yatırım","Eğitimin öğrenenlere yakınlaştırılması","Eğitime geleneksel yöntemlerle devam edilmesi","Her türlü eğitime değer verilmesi"], 3),
 # Bölüm 7
 Q("Aşağıdakilerden hangisi kullanıcıların daha basit donanıma sahip bilgisayarlarla çalışmasının avantajlarından birisi değildir?",
   ["Gürültü","Bakım ve onarım maliyeti","Enerji tüketimi","Donanım maliyeti","İnternet bağlantısı"], 4),
 Q("Bir bilgi sisteminin %99,995 kullanılabilirlik oranını sağlaması için bir yılda en fazla toplam kaç dakika çalışmaması kabul edilebilir?",
   ["5","26","99","365","1729"], 1),
 Q("Aşağıdakilerden hangisi dağıtık bilişim sistemlerinin üstünlüklerinden biri değildir?",
   ["Hızlı çalışmaları","Verimli olmaları","Diğer sistemlerle işbirliği","Hatasız çalışmaları","Ölçeklenebilir olmaları"], 3),
 Q("Hizmet odaklı mimari (SOA) aşağıdaki hangi bulut bilişim mimarisi ile ilgilidir?",
   ["İnternet teknolojisi","Dağıtık sistem","Donanım","Veri merkezi","Sistem yönetimi"], 0),
 Q("Hipervizör kavramı aşağıdakiler hangisi ile ilişkilidir?",
   ["İzleme sistemi","Sanallaştırma yazılımı","Veritabanı türü","Hizmet sunum modeli","Bulut türü"], 1),
 Q("Kullanıcının sanal bir işletim sistemini kullanmak üzere yetkilendirildiği bulut bilişim hizmet modelinin kısaltması aşağıdakilerden hangisinde doğru verilmiştir?",
   ["PaaS","SaaS","SECaaS","TaaS","IaaS"], 4),
 Q("Aşağıdakilerden hangisi bulut bilişimin yayılma türlerinden birisi değildir?",
   ["Özel bulut","Melez bulut","İş bulutu","Kamu bulutu","Topluluk bulutu"], 2),
 Q("Aşağıdakilerden hangisi bulut bilişimin üstünlüklerinden biri değildir?",
   ["Birlikte çalışma","Ölçeklenebilirlik","Çevre birimlerin etkin kullanılması","İş uygulamalarında esneklik","Devamlılık"], 2),
 Q("Aşağıdakilerden hangisi bir bulut depolama hizmeti değildir?",
   ["Hangouts","Dropbox","OneDrive","Yandex.Disk","iCloud"], 0),
 Q("Aşağıdaki hizmetlerden hangisi bireylerin duygu ve düşüncelerini internet ortamında yayınladıkları bir hizmettir?",
   ["E-Belgeler","Web Sayfası","Sunu","Blog","Drive"], 3),
 # Bölüm 8
 Q("Aşağıdakilerden hangisi teknolojik gelişmenin aşamalarından biri değildir?",
   ["Keşif","Buluş","Yenilik","Yayılma","Pazarlama"], 4),
 Q("Aşağıdakilerden hangisi bir mikroişlemciye sığdırılabilen transistör sayısının iki katına çıkması için geçen süredir?",
   ["Yaklaşık 2 ay","Yaklaşık 12 ay","Yaklaşık 2 yıl","Yaklaşık 12 yıl","Yaklaşık 24 yıl"], 2),
 Q("Aşağıdakilerden hangisi verilen bir tarihte toplumda aynı anda kullanılabilen teknolojilerden biri değildir?",
   ["Geleneksel teknolojiler","Güncel teknolojiler","Sınırdaki teknolojiler","Yakın gelecekteki teknolojiler","Uzak gelecekteki teknolojiler"], 4),
 Q("Aşağıdakilerden hangisi 2015 yılında ülkemizde yayılmasını tamamlamış geleneksel teknolojilerden biri değildir?",
   ["Radyo","3G","Müzik setleri","Kablolu internet","İnternet erişimi olmayan hücresel telefonlar"], 1),
 Q("Aşağıdakilerden hangisi sınırdaki bir teknolojidir?",
   ["Bilgisayarla görü","Ses tanıma","Anlamsal (semantik) ağ","Bilgisayarla oluşturulan görüntü (CGI)","Holografik görüntüleme"], 4),
 Q("Aşağıdakilerden hangisi güncel bir teknolojidir?",
   ["Sanal gerçeklik","Akıllı kişisel yardımcılar","Bağlam farkındalıklı bilgi işlem","Giyilebilir bilgisayarlar","Beyin implantları"], 0),
 Q("\"Kullanıcı tarafından vücudunun çevresine giyilebilen, hidrolik ve motorlar yardımıyla kullanıcının kas hareketlerini destekleyen mobil makine\" aşağıdakilerden hangisidir?",
   ["Android","Güçlendirilmiş dış iskelet","Giyilebilir bilgisayar","e-Tekstil","Taşıt iletişim sistemi"], 1),
 Q("Beyin-bilgisayar arayüzü için aşağıdaki tanımlardan hangisi en uygundur?",
   ["Beyin ile dışsal bir cihaz arasında doğrudan iletişim oluşturma yoludur.","İnsanların herkes tarafından algılanan gerçeklikten ayırt edemeyecekleri bir sanal ortama daldırılmalarıdır.","Bireyin zihinsel içeriğinin beyinden okunarak bir bilgisayara yüklenmesini tanımlayan kuramsal bir süreçtir.","Beynin yüksek düzey bilişsel süreçlerini destekleyecek kuramsal bir yapay dış enformasyon işleme sistemidir.","Hayvan ya da insan beyni ile benzer bilişsel özelliklere sahip yazılım ve donanımların geliştirilmesini amaçlayan araştırma alanıdır."], 0),
 Q("\"Beynin yüksek düzey bilişsel süreçlerini destekleyecek (artıracak) kuramsal bir yapay dış enformasyon işleme sistemi\" aşağıdakilerden hangisidir?",
   ["Exocortex","Sanal retinal görüntüleme","Biyometri","Yaşam günlüğü","Kuantum bilgi işlem"], 0),
 Q("Yapay zekânın insan zekâsıyla aynı güce kavuştuğu noktaya verilen isim aşağıdakilerden hangisidir?",
   ["Transhümanizm","Teknolojik tekillik","Teknolojik süreklilik","İnsan-bilgisayar birlikteliği","Yapay beyin"], 1),
]

def esc(s):
    return s.replace("'", "''")

def emit_exam(buf, exam, questions):
    buf.write(f"\n-- ===== {exam['title']} ({len(questions)} questions) =====\n")
    buf.write("insert into public.exams (id, slug, title, description, question_count) values\n")
    buf.write(f"  ('{exam['id']}', '{esc(exam['slug'])}', '{esc(exam['title'])}', '{esc(exam['description'])}', {len(questions)})\n")
    buf.write("on conflict (id) do update set title=excluded.title, description=excluded.description, question_count=excluded.question_count;\n\n")
    for i, q in enumerate(questions, start=1):
        qid = uid("q", exam["slug"], i)
        buf.write("insert into public.questions (id, exam_id, question_number, question_text) values\n")
        buf.write(f"  ('{qid}', '{exam['id']}', {i}, '{esc(q['text'])}')\n")
        buf.write("on conflict (id) do update set question_text=excluded.question_text, question_number=excluded.question_number;\n")
        buf.write("insert into public.question_options (id, question_id, option_label, option_text, is_correct, sort_order) values\n")
        rows = []
        for j, opt in enumerate(q["options"]):
            oid = uid("o", exam["slug"], i, j)
            is_correct = "true" if j == q["correct"] else "false"
            rows.append(f"  ('{oid}', '{qid}', '{LETTERS[j]}', '{esc(opt)}', {is_correct}, {j})")
        buf.write(",\n".join(rows) + "\n")
        buf.write("on conflict (id) do update set option_text=excluded.option_text, is_correct=excluded.is_correct, sort_order=excluded.sort_order;\n\n")

def main():
    out = io.StringIO()
    out.write("-- AUTO-GENERATED by scripts/generate_seed.py — do not edit by hand.\n")
    out.write("-- Seeds both exams with all questions, options and correct answers.\n")
    out.write("begin;\n")
    emit_exam(out, EXAM1, exam1)
    emit_exam(out, EXAM2, exam2)
    out.write("commit;\n")
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(here, "supabase", "seed.sql")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(out.getvalue())
    print(f"Wrote {path}")
    print(f"Exam 1: {len(exam1)} questions | Exam 2: {len(exam2)} questions | Total: {len(exam1)+len(exam2)}")

if __name__ == "__main__":
    main()
