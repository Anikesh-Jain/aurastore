import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting PostgreSQL database seed (Expanded 36-Product Catalog)...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@ecommerce.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminSecurePassword123!";
  const adminName = process.env.ADMIN_NAME || "Store Administrator";

  console.log(`👤 Seeding Admin User (${adminEmail})...`);
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
      name: adminName,
    },
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin user seeded with ID: ${adminUser.id}`);

  // Seed Demo Customer
  const customerPassword = await bcrypt.hash("Customer123!", 12);
  const demoCustomer = await prisma.user.upsert({
    where: { email: "customer@ecommerce.com" },
    update: {},
    create: {
      email: "customer@ecommerce.com",
      name: "Alex Johnson",
      password: customerPassword,
      role: Role.CUSTOMER,
      addresses: {
        create: {
          fullName: "Alex Johnson",
          phone: "+91 9876543210",
          street: "42 MG Road, Indiranagar",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560038",
          country: "India",
          isDefault: true,
        },
      },
    },
  });
  console.log(`✅ Demo customer seeded: ${demoCustomer.email}`);

  // Seed Categories
  console.log("📁 Seeding Categories...");
  const categoriesData = [
    {
      name: "Electronics & Gadgets",
      slug: "electronics",
      description: "Cutting-edge smartphones, laptops, high-res monitors, and computing gear.",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Audio & Wearables",
      slug: "audio-wearables",
      description: "Premium noise-cancelling headphones, true wireless earbuds, and smartwatches.",
      imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Fashion & Lifestyle",
      slug: "fashion",
      description: "Contemporary urban wear, selvedge denim, running sneakers, and technical gear.",
      imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Home & Smart Living",
      slug: "home-living",
      description: "Modern minimalist home aesthetics, smart ambient lights, and ergonomic workspace setup.",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const categoryMap: { [key: string]: string } = {};

  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        publicId: `category_${cat.slug}`,
      },
    });
    categoryMap[cat.slug] = category.id;
  }
  console.log(`✅ ${Object.keys(categoryMap).length} Categories seeded.`);

  // Seed Products (36 total: exactly 9 per category)
  console.log("🛍️ Seeding 36 Products (9 per category)...");
  const productsData = [
    // ==========================================
    // 1. ELECTRONICS & GADGETS (9 products)
    // ==========================================
    {
      name: "Apex Pro Ultra 5G Smartphone",
      slug: "apex-pro-ultra-smartphone-5g",
      description: "Flagship 5G smartphone featuring a 6.7-inch 120Hz Dynamic AMOLED display, Snapdragon 8 Gen 3 chipset, 108MP quad-camera matrix with 5x optical zoom, and 5000mAh battery with 80W SuperVOOC fast charging.",
      price: 64999.00,
      discountPrice: 59999.00,
      stock: 35,
      sku: "ELC-PHN-001",
      isFeatured: true,
      categoryId: categoryMap["electronics"],
      ratingAvg: 4.9,
      ratingCount: 56,
      images: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Titan Blade 16 OLED Creator Laptop",
      slug: "titan-blade-creator-laptop-16",
      description: "Ultra-portable performance laptop engineered for professionals and creators. Features Intel Core Ultra 9 processor, NVIDIA GeForce RTX 4070 8GB GPU, 32GB LPDDR5X RAM, 1TB Gen4 NVMe SSD, and 3.2K 120Hz OLED color-accurate display.",
      price: 149999.00,
      discountPrice: 139999.00,
      stock: 20,
      sku: "ELC-LPT-002",
      isFeatured: true,
      categoryId: categoryMap["electronics"],
      ratingAvg: 4.8,
      ratingCount: 31,
      images: [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Nova Minimalist Mechanical Keyboard",
      slug: "nova-minimalist-mechanical-keyboard",
      description: "Custom hot-swappable 75% mechanical keyboard with factory-lubed linear switches, gasket mount structure, multi-layer sound-dampening foam, South-facing RGB backlighting, and CNC anodized aluminum frame.",
      price: 8999.00,
      discountPrice: 7499.00,
      stock: 60,
      sku: "ELC-KBD-003",
      isFeatured: true,
      categoryId: categoryMap["electronics"],
      ratingAvg: 4.7,
      ratingCount: 42,
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Vision 27-inch 4K UHD USB-C Monitor",
      slug: "vision-pro-4k-uhd-monitor-27",
      description: "27-inch IPS 4K UHD (3840 x 2160) ultra-narrow bezel monitor with 99% DCI-P3 color gamut, VESA DisplayHDR 400, factory calibration certificate, and 65W USB-C single-cable connectivity.",
      price: 29999.00,
      discountPrice: 26499.00,
      stock: 25,
      sku: "ELC-MON-004",
      isFeatured: false,
      categoryId: categoryMap["electronics"],
      ratingAvg: 4.8,
      ratingCount: 28,
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Quantum Tab S Pro 11-inch Tablet",
      slug: "quantum-tab-s-pro-11",
      description: "Next-gen entertainment and productivity tablet with 11-inch 2.8K 120Hz IPS panel, Snapdragon 8 Gen 2, quad stereo speakers tuned by Dolby Atmos, active stylus with palm rejection, and 8600mAh battery.",
      price: 36999.00,
      discountPrice: 32999.00,
      stock: 40,
      sku: "ELC-TAB-005",
      isFeatured: false,
      categoryId: categoryMap["electronics"],
      ratingAvg: 4.6,
      ratingCount: 19,
      images: [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Swift Master Ergonomic Wireless Mouse",
      slug: "swift-master-wireless-mouse",
      description: "Ergonomically sculpted precision wireless mouse with 8000 DPI Darkfield optical sensor tracking on glass, MagSpeed electromagnetic scroll wheel, USB-C fast charging, and triple-device multi-connectivity.",
      price: 4499.00,
      discountPrice: 3699.00,
      stock: 80,
      sku: "ELC-MOU-006",
      isFeatured: false,
      categoryId: categoryMap["electronics"],
      ratingAvg: 4.7,
      ratingCount: 53,
      images: [
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Stream Clarity 4K HDR Webcam",
      slug: "stream-clarity-4k-hdr-webcam",
      description: "Professional 4K Ultra HD webcam with Sony STARVIS sensor, auto-framing AI tracking, dual omnidirectional noise-cancelling microphones, physical magnetic privacy cover, and HDR lighting optimization.",
      price: 7999.00,
      discountPrice: 6499.00,
      stock: 55,
      sku: "ELC-CAM-007",
      isFeatured: false,
      categoryId: categoryMap["electronics"],
      ratingAvg: 4.6,
      ratingCount: 22,
      images: [
        "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Volt Vault 65W PD 20000mAh Power Bank",
      slug: "volt-vault-65w-power-bank-20000",
      description: "High-capacity 20000mAh portable power bank with 65W Power Delivery output capable of rapidly charging MacBook Pro, Dell XPS, iPhone, and Android flagships simultaneously. Features digital LED status display.",
      price: 4299.00,
      discountPrice: 3499.00,
      stock: 90,
      sku: "ELC-PWR-008",
      isFeatured: false,
      categoryId: categoryMap["electronics"],
      ratingAvg: 4.8,
      ratingCount: 67,
      images: [
        "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Nexus Thunderbolt 4 12-in-1 Docking Station",
      slug: "nexus-thunderbolt-4-docking-station",
      description: "Heavy-duty aluminum Thunderbolt 4 docking station with 40Gbps data bandwidth, dual 4K @ 60Hz display support, 90W host Power Delivery, Gigabit Ethernet, SD 4.0 card reader, and optical audio output.",
      price: 14999.00,
      discountPrice: 12999.00,
      stock: 30,
      sku: "ELC-DCK-009",
      isFeatured: false,
      categoryId: categoryMap["electronics"],
      ratingAvg: 4.9,
      ratingCount: 18,
      images: [
        "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=80",
      ],
    },

    // ==========================================
    // 2. AUDIO & WEARABLES (9 products)
    // ==========================================
    {
      name: "Aura Pro Wireless ANC Headphones",
      slug: "aura-pro-wireless-anc-headphones",
      description: "Studio-grade active noise cancellation with 40mm custom beryllium drivers, spatial audio with dynamic head tracking, 40-hour battery life, and ultra-plush memory foam ear cushions for all-day comfort.",
      price: 19999.00,
      discountPrice: 16999.00,
      stock: 45,
      sku: "AUR-HDP-001",
      isFeatured: true,
      categoryId: categoryMap["audio-wearables"],
      ratingAvg: 4.8,
      ratingCount: 64,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Chronos Stealth Smartwatch Series 7",
      slug: "chronos-stealth-smartwatch-series-7",
      description: "Ultra-thin aerospace titanium chassis with 1.4-inch AMOLED sapphire display, optical ECG monitor, SPO2 sensor, GPS multisport tracking, sleep analytics, 5ATM water resistance, and 7-day battery life.",
      price: 24999.00,
      discountPrice: 21999.00,
      stock: 30,
      sku: "CHR-WAT-002",
      isFeatured: true,
      categoryId: categoryMap["audio-wearables"],
      ratingAvg: 4.9,
      ratingCount: 48,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Pulse True Wireless ANC Earbuds",
      slug: "pulse-true-wireless-anc-earbuds",
      description: "Hi-Res LDAC audio streaming with 11mm dynamic drivers, hybrid active noise cancellation up to 45dB, crystal-clear quad mic beamforming, Qi wireless charging case, and IPX5 splash protection.",
      price: 7999.00,
      discountPrice: 6499.00,
      stock: 75,
      sku: "PLS-EBD-006",
      isFeatured: true,
      categoryId: categoryMap["audio-wearables"],
      ratingAvg: 4.7,
      ratingCount: 52,
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "SoundCore Cinema Dolby Atmos Soundbar",
      slug: "soundcore-cinema-soundbar-dolby-atmos",
      description: "Immersive 320W 3.1.2-channel soundbar system with wireless down-firing subwoofer, dedicated center dialog channel, HDMI eARC, 4K HDR pass-through, and Bluetooth 5.3 streaming.",
      price: 18999.00,
      discountPrice: 15499.00,
      stock: 25,
      sku: "AUD-SBR-004",
      isFeatured: false,
      categoryId: categoryMap["audio-wearables"],
      ratingAvg: 4.8,
      ratingCount: 29,
      images: [
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Echo Beat 30W Rugged Bluetooth Speaker",
      slug: "echo-beat-portable-waterproof-speaker",
      description: "Compact yet room-filling 30W wireless speaker with dual passive radiators, 360-degree acoustic dispersion, IP67 waterproof & dustproof rating, integrated carry carabiner, and 18-hour continuous playback.",
      price: 4999.00,
      discountPrice: 3999.00,
      stock: 65,
      sku: "AUD-SPK-005",
      isFeatured: false,
      categoryId: categoryMap["audio-wearables"],
      ratingAvg: 4.7,
      ratingCount: 41,
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "VocalStudio USB-C Condenser Microphone",
      slug: "vocal-studio-usb-condenser-microphone",
      description: "Broadcast-quality USB condenser microphone for podcasting, streaming, and vocals. Features 24-bit/192kHz sampling rate, cardioid pickup pattern, zero-latency 3.5mm monitor jack, and LED mute indicator.",
      price: 6499.00,
      discountPrice: 5299.00,
      stock: 40,
      sku: "AUD-MIC-006",
      isFeatured: false,
      categoryId: categoryMap["audio-wearables"],
      ratingAvg: 4.8,
      ratingCount: 33,
      images: [
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "HiFi Lossless USB-C DAC & Headphone Amp",
      slug: "hifi-lossless-dac-headphone-amp",
      description: "Audiophile-grade portable USB-C DAC featuring ESS Sabre ES9281AC Pro decoder, Native DSD512 and 32-bit/768kHz PCM decoding, dual 3.5mm single-ended and 4.4mm balanced output ports.",
      price: 5999.00,
      discountPrice: 4999.00,
      stock: 35,
      sku: "AUD-DAC-007",
      isFeatured: false,
      categoryId: categoryMap["audio-wearables"],
      ratingAvg: 4.9,
      ratingCount: 20,
      images: [
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Phantom 7.1 Surround RGB Gaming Headset",
      slug: "phantom-surround-rgb-gaming-headset",
      description: "Tournament-spec over-ear gaming headset with virtual 7.1 positional surround sound, 53mm neodymium drivers, detachable noise-cancelling broadcast microphone, and breathable cooling-gel ear pads.",
      price: 5499.00,
      discountPrice: 4299.00,
      stock: 50,
      sku: "AUD-GAM-008",
      isFeatured: false,
      categoryId: categoryMap["audio-wearables"],
      ratingAvg: 4.6,
      ratingCount: 37,
      images: [
        "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Studio Monitor Pro Reference Headphones",
      slug: "studio-monitor-m50x-wired-headphones",
      description: "Critically acclaimed professional studio monitor headphones designed for audio mixing and mastering. 45mm large-aperture drivers with copper-clad aluminum wire voice coils and 90-degree swiveling earcups.",
      price: 11999.00,
      discountPrice: 9999.00,
      stock: 30,
      sku: "AUD-REF-009",
      isFeatured: false,
      categoryId: categoryMap["audio-wearables"],
      ratingAvg: 4.9,
      ratingCount: 58,
      images: [
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80",
      ],
    },

    // ==========================================
    // 3. FASHION & LIFESTYLE (9 products)
    // ==========================================
    {
      name: "Verve Urban Everyday Backpack 20L",
      slug: "verve-urban-everyday-backpack-20l",
      description: "Weatherproof 1000D Cordura fabric backpack with magnetic Fidlock quick-release buckles, dedicated padded 16-inch laptop compartment, hidden RFID passport pocket, and luggage trolley pass-through.",
      price: 5499.00,
      discountPrice: 4299.00,
      stock: 50,
      sku: "VRV-BAG-004",
      isFeatured: true,
      categoryId: categoryMap["fashion"],
      ratingAvg: 4.7,
      ratingCount: 39,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "AeroFlow Carbon Plate Running Sneakers",
      slug: "aero-flow-mesh-running-sneakers",
      description: "Ultralight marathon running shoes engineered with responsive supercritical foam midsole, embedded full-length carbon fiber plate, breathable engineered mesh upper, and Continental rubber traction pads.",
      price: 6999.00,
      discountPrice: 5499.00,
      stock: 45,
      sku: "FSH-SNK-002",
      isFeatured: true,
      categoryId: categoryMap["fashion"],
      ratingAvg: 4.8,
      ratingCount: 46,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Zenith Heavyweight 450 GSM Cotton Hoodie",
      slug: "zenith-heavyweight-cotton-hoodie",
      description: "Luxury oversized streetwear hoodie tailored from pre-shrunk 450 GSM organic French terry cotton. Features double-lined seamless hood, reinforced ribbed cuffs, drop-shoulder silhouette, and hidden kangaroo pocket.",
      price: 3499.00,
      discountPrice: 2799.00,
      stock: 60,
      sku: "FSH-HOD-003",
      isFeatured: false,
      categoryId: categoryMap["fashion"],
      ratingAvg: 4.9,
      ratingCount: 34,
      images: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Core Essential 100% Supima Cotton T-Shirt",
      slug: "core-essential-supima-cotton-tshirt",
      description: "Ultra-soft premium crewneck t-shirt woven from 100% American Supima extra-long staple cotton. Exceptional colorfastness, silk-like drape, reinforced double-needle neck rib, and zero side seams.",
      price: 1499.00,
      discountPrice: 1199.00,
      stock: 100,
      sku: "FSH-TEE-004",
      isFeatured: false,
      categoryId: categoryMap["fashion"],
      ratingAvg: 4.7,
      ratingCount: 72,
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "StormShield Packable Technical Windbreaker",
      slug: "storm-shield-technical-windbreaker",
      description: "Weather-resistant minimalist technical shell constructed with 3-layer micro-ripstop nylon, DWR hydrophobic coating, YKK Aquaguard waterproof zippers, underarm vent eyelets, and self-stowable pack pouch.",
      price: 4999.00,
      discountPrice: 3999.00,
      stock: 40,
      sku: "FSH-JKT-005",
      isFeatured: false,
      categoryId: categoryMap["fashion"],
      ratingAvg: 4.8,
      ratingCount: 27,
      images: [
        "https://images.unsplash.com/photo-1544441893-675973e31985?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Urban Tactical Relaxed-Fit Cargo Pants",
      slug: "urban-tactical-modular-cargo-pants",
      description: "Modern streetwear utility trousers made from heavy-duty stretch cotton-twill. Equipped with 6 ergonomic bellows cargo pockets, integrated drawstring waist, and adjustable ankle cinch toggles.",
      price: 3999.00,
      discountPrice: 3199.00,
      stock: 55,
      sku: "FSH-PNT-006",
      isFeatured: false,
      categoryId: categoryMap["fashion"],
      ratingAvg: 4.6,
      ratingCount: 31,
      images: [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Raw Selvedge Indigo Denim Straight Jeans",
      slug: "classic-selvedge-denim-jeans",
      description: "Authentic 14oz shuttle-loomed Japanese selvedge raw denim jeans. Features genuine redline selvedge ID, custom copper donut button fly, veg-tan leather back patch, and classic straight leg cut tailored to develop unique fades.",
      price: 4499.00,
      discountPrice: 3699.00,
      stock: 40,
      sku: "FSH-JNS-007",
      isFeatured: false,
      categoryId: categoryMap["fashion"],
      ratingAvg: 4.8,
      ratingCount: 23,
      images: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Voyager Polarized Matte Acetate Sunglasses",
      slug: "voyager-polarized-matte-sunglasses",
      description: "Handcrafted cellulose acetate sunglasses with premium 9-layer TAC polarized lenses providing 100% UV400 UVA/UVB protection, reinforced 5-barrel stainless steel hinges, and protective vegan leather hardcase.",
      price: 2999.00,
      discountPrice: 2299.00,
      stock: 70,
      sku: "FSH-SGL-008",
      isFeatured: false,
      categoryId: categoryMap["fashion"],
      ratingAvg: 4.7,
      ratingCount: 38,
      images: [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Minimalist RFID Full-Grain Leather Wallet",
      slug: "minimalist-full-grain-leather-wallet",
      description: "Slim bifold wallet artisan-crafted from vegetable-tanned full-grain Italian leather. Holds up to 10 cards with quick-access front thumb slot, full-length billfold compartment, and integrated electromagnetic RFID shield.",
      price: 2499.00,
      discountPrice: 1899.00,
      stock: 85,
      sku: "FSH-WLT-009",
      isFeatured: false,
      categoryId: categoryMap["fashion"],
      ratingAvg: 4.9,
      ratingCount: 61,
      images: [
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1606503825008-909a67e723a9?w=1000&auto=format&fit=crop&q=80",
      ],
    },

    // ==========================================
    // 4. HOME & SMART LIVING (9 products)
    // ==========================================
    {
      name: "Lumina Smart Ambient Desk Lamp",
      slug: "lumina-smart-ambient-desk-lamp",
      description: "Circadian rhythm adaptive lighting with stepless color temperature adjustment (2700K - 6500K), built-in 15W MagSafe wireless smartphone charger, touch brightness slider, and Alexa/Google Home voice control.",
      price: 6999.00,
      discountPrice: 5999.00,
      stock: 25,
      sku: "LUM-LMP-005",
      isFeatured: true,
      categoryId: categoryMap["home-living"],
      ratingAvg: 4.8,
      ratingCount: 35,
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Barista Touch 15-Bar Espresso Maker",
      slug: "barista-touch-espresso-coffee-maker",
      description: "Compact domestic espresso machine equipped with Italian 15-bar high-pressure pump, rapid thermoblock heating system, professional stainless steel steam wand for microfoam latte art, and dual-cup filter baskets.",
      price: 14999.00,
      discountPrice: 12499.00,
      stock: 25,
      sku: "HOM-COF-002",
      isFeatured: true,
      categoryId: categoryMap["home-living"],
      ratingAvg: 4.9,
      ratingCount: 44,
      images: [
        "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "PureAir H13 True HEPA Smart Air Purifier",
      slug: "pure-air-true-hepa-smart-air-purifier",
      description: "Medical-grade 3-stage filtration system capturing 99.97% of airborne pollen, pet dander, dust, and smoke. Suitable for large living rooms up to 450 sq.ft with real-time laser PM2.5 air index display and whisper 22dB sleep mode.",
      price: 11499.00,
      discountPrice: 9499.00,
      stock: 30,
      sku: "HOM-AIR-003",
      isFeatured: false,
      categoryId: categoryMap["home-living"],
      ratingAvg: 4.7,
      ratingCount: 39,
      images: [
        "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "ZenCraft Bamboo Multi-Tier Desk Organizer",
      slug: "zen-bamboo-ergonomic-desk-organizer",
      description: "Handcrafted from 100% sustainable organic Moso bamboo with water-resistant natural lacquer. Features customizable modular divider compartments, tablet stand groove, pen wells, and cable routing channel.",
      price: 2299.00,
      discountPrice: 1799.00,
      stock: 65,
      sku: "HOM-DSK-004",
      isFeatured: false,
      categoryId: categoryMap["home-living"],
      ratingAvg: 4.6,
      ratingCount: 28,
      images: [
        "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "AuraGlow 5-Meter Matter Smart LED Strip",
      slug: "aura-glow-smart-rgb-led-lightstrip-5m",
      description: "5-meter RGB+IC addressable smart lightstrip compatible with Apple HomeKit, Google Home, and Matter. Delivers 16 million colors with multi-zone animated rainbow effects, dynamic mic music synchronization, and cuttable design.",
      price: 2799.00,
      discountPrice: 2199.00,
      stock: 80,
      sku: "HOM-LGT-005",
      isFeatured: false,
      categoryId: categoryMap["home-living"],
      ratingAvg: 4.7,
      ratingCount: 51,
      images: [
        "https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "CloudSoft 400TC Egyptian Cotton Bedsheet Set",
      slug: "cloud-soft-egyptian-cotton-bedsheet-set",
      description: "Luxury King-size fitted bedsheet set woven with 400 thread count 100% authentic long-staple Egyptian cotton in a silky sateen finish. Includes 1 fitted sheet (fits up to 16-inch deep mattresses) and 2 king envelope pillowcases.",
      price: 3999.00,
      discountPrice: 3199.00,
      stock: 45,
      sku: "HOM-BED-006",
      isFeatured: false,
      categoryId: categoryMap["home-living"],
      ratingAvg: 4.8,
      ratingCount: 36,
      images: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Nordic Minimalist 12-inch Silent Wall Clock",
      slug: "nordic-minimalist-silent-wall-clock",
      description: "12-inch modern wall clock crafted with an ultra-matte mineral glass face, natural solid pine wood bezel, laser-engraved hour markers, and premium sweep-movement quartz mechanism with zero audible ticking.",
      price: 1999.00,
      discountPrice: 1499.00,
      stock: 60,
      sku: "HOM-CLK-007",
      isFeatured: false,
      categoryId: categoryMap["home-living"],
      ratingAvg: 4.6,
      ratingCount: 25,
      images: [
        "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "HydroPure 1.5L Precision Electric Kettle",
      slug: "hydro-pure-smart-electric-kettle-1-5l",
      description: "Food-grade 304 seamless stainless steel electric kettle with digital base temperature control (from 40°C to 100°C in 1-degree increments), 1500W rapid boil, 2-hour keep-warm function, and cool-touch double-wall exterior.",
      price: 3499.00,
      discountPrice: 2899.00,
      stock: 50,
      sku: "HOM-KTL-008",
      isFeatured: false,
      categoryId: categoryMap["home-living"],
      ratingAvg: 4.8,
      ratingCount: 42,
      images: [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=1000&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Geometric Velvet Plush Cushion Set (Pack of 4)",
      slug: "scandinavian-geometric-velvet-cushion-set",
      description: "Set of 4 luxury 18x18-inch throw cushion covers crafted from heavy Dutch velvet fabric with gold foil embossed Scandinavian geometric accents, concealed matching-color zippers, and machine washable durability.",
      price: 1899.00,
      discountPrice: 1399.00,
      stock: 75,
      sku: "HOM-CSH-009",
      isFeatured: false,
      categoryId: categoryMap["home-living"],
      ratingAvg: 4.7,
      ratingCount: 30,
      images: [
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000&auto=format&fit=crop&q=80",
      ],
    },
  ];

  const targetSlugs = productsData.map((p) => p.slug);

  // Clean up any extraneous products so exact count is maintained
  await prisma.product.deleteMany({
    where: { slug: { notIn: targetSlugs } },
  });

  for (const prod of productsData) {
    const existing = await prisma.product.findUnique({
      where: { slug: prod.slug },
      include: { images: true, reviews: true },
    });

    if (!existing) {
      const createdProduct = await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          price: prod.price,
          discountPrice: prod.discountPrice,
          stock: prod.stock,
          sku: prod.sku,
          isFeatured: prod.isFeatured,
          categoryId: prod.categoryId,
          ratingAvg: prod.ratingAvg,
          ratingCount: prod.ratingCount,
          images: {
            create: prod.images.map((url, idx) => ({
              url: url,
              publicId: `prod_${prod.slug}_${idx}`,
              isPrimary: idx === 0,
              altText: `${prod.name} photo ${idx + 1}`,
            })),
          },
        },
      });

      // Add a sample review with ReviewImage
      await prisma.review.create({
        data: {
          userId: demoCustomer.id,
          productId: createdProduct.id,
          rating: 5,
          title: "Incredible build quality and performance!",
          comment: `I've been using the ${prod.name} for over two weeks. Exceeded all my expectations. High quality materials, seamless user experience, and arrived in premium packaging. Highly recommended!`,
          images: {
            create: [
              {
                url: prod.images[0],
                publicId: `review_img_${createdProduct.id}_1`,
              },
            ],
          },
        },
      });
    } else {
      // Idempotently update product attributes
      await prisma.product.update({
        where: { slug: prod.slug },
        data: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          discountPrice: prod.discountPrice,
          stock: prod.stock,
          sku: prod.sku,
          isFeatured: prod.isFeatured,
          categoryId: prod.categoryId,
          ratingAvg: prod.ratingAvg,
          ratingCount: prod.ratingCount,
        },
      });

      // Ensure images are populated if missing
      if (existing.images.length === 0) {
        await prisma.productImage.createMany({
          data: prod.images.map((url, idx) => ({
            productId: existing.id,
            url: url,
            publicId: `prod_${prod.slug}_${idx}`,
            isPrimary: idx === 0,
            altText: `${prod.name} photo ${idx + 1}`,
          })),
        });
      }

      // Ensure at least one review exists
      if (existing.reviews.length === 0) {
        await prisma.review.create({
          data: {
            userId: demoCustomer.id,
            productId: existing.id,
            rating: 5,
            title: "Incredible build quality and performance!",
            comment: `I've been using the ${prod.name} for over two weeks. Exceeded all my expectations. High quality materials, seamless user experience, and arrived in premium packaging. Highly recommended!`,
            images: {
              create: [
                {
                  url: prod.images[0],
                  publicId: `review_img_${existing.id}_1`,
                },
              ],
            },
          },
        });
      }
    }
  }
  console.log(`✅ 36 Products (9 per category) seeded and verified.`);

  // Seed Promo Coupons
  console.log("🎟️ Seeding Promo Coupons...");
  const couponsData = [
    {
      code: "WELCOME20",
      discountPercent: 20,
      minOrderValue: 2000.00,
      maxDiscount: 1000.00,
      usageLimit: 500,
    },
    {
      code: "MEGA500",
      discountAmount: 500.00,
      minOrderValue: 3000.00,
      usageLimit: 200,
    },
    {
      code: "FESTIVE10",
      discountPercent: 10,
      minOrderValue: 1000.00,
      maxDiscount: 2000.00,
      usageLimit: 1000,
    },
  ];

  for (const coup of couponsData) {
    await prisma.coupon.upsert({
      where: { code: coup.code },
      update: {},
      create: {
        code: coup.code,
        discountPercent: coup.discountPercent,
        discountAmount: coup.discountAmount,
        minOrderValue: coup.minOrderValue,
        maxDiscount: coup.maxDiscount,
        usageLimit: coup.usageLimit,
        isActive: true,
      },
    });
  }
  console.log("✅ Coupons seeded successfully.");
  console.log("🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
