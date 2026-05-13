"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/lib/supabase";
import { getDonorData, HEALTH_COLOR, SPECIES_EMOJI, SPECIES_COLOR, getOccasionIcon, getOccasionColor } from "@/lib/getDonorData";
import type { DonorProfile, DonorTree } from "@/lib/getDonorData";

type MapStyle = "light" | "satellite";
const MAP_STYLES: Record<MapStyle, string> = {
  light:     "mapbox://styles/mapbox/light-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
};

const TIER_LABELS: Record<string, string> = {
  '1000': '🌳 Individual Trees',
  '500':  '🤝 Joint Trees',
  '5000': '🏙️ Miyawaki Forest',
  '250':  '🌱 Community (₹250)',
  '100':  '🌿 Community (₹100)',
}
const TIER_ORDER = ['1000','500','5000','250','100']

export default function MyTreeClient() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [mapStyle,   setMapStyle]   = useState<MapStyle>("light");
  const [popup,      setPopup]      = useState<any>(null);
  const [copied,     setCopied]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [uploading,  setUploading]  = useState(false);
  const certRef  = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const [donor,    setDonor]    = useState<DonorProfile | null>(null);
  const [myTrees,  setMyTrees]  = useState<DonorTree[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [photoPopup, setPhotoPopup] = useState<{ url: string; label: string; treeId: string } | null>(null);
  const [mapPopup,   setMapPopup]   = useState<{ lat: number; lng: number; tree: DonorTree } | null>(null);

  const [isAdminView,        setIsAdminView]        = useState(false);
  const [adminViewDonorName, setAdminViewDonorName] = useState('');

  useEffect(() => { init() }, []);

  async function init() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const donorId   = searchParams.get('donor_id');
    const adminView = searchParams.get('admin_view') === 'true';

    if (!session && !adminView) { window.location.replace('/my-tree/login'); return; }
    if (adminView && !session) { window.location.replace('/admin/login'); return; }

    if (donorId && adminView) {
      const { data: currentUser } = await supabase
        .from('users').select('role').eq('email', session?.user?.email || '').single();
      if (currentUser?.role !== 'ADMIN') { window.location.replace('/my-tree/login'); return; }

      const { data: donorRow } = await supabase
        .from('donors').select('email, name').eq('id', donorId).single();
      if (!donorRow) { window.location.replace('/admin/donors'); return; }

      const { donor, myTrees, occasionTimeline } = await getDonorData(donorRow.email);
      if (!donor) { window.location.replace('/admin/donors'); return; }

      setIsAdminView(true);
      setAdminViewDonorName(donorRow.name);
      setDonor(donor);
      setMyTrees(myTrees);
      setTimeline(occasionTimeline);
      setPhotoUrl(donor.photo_url);
    } else {
      const { donor, myTrees, occasionTimeline } = await getDonorData(session?.user?.email || '');
      if (!donor) { window.location.replace('/my-tree/login'); return; }
      setDonor(donor);
      setMyTrees(myTrees);
      setTimeline(occasionTimeline);
      setPhotoUrl(donor.photo_url);
    }
    setLoading(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !donor) return;
    setUploading(true);
    const path = `donor-${donor.raw_id}-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from('donor-photos').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('donor-photos').getPublicUrl(path);
      await supabase.from('donors').update({ photo_url: data.publicUrl }).eq('id', donor.raw_id);
      setPhotoUrl(data.publicUrl);
    }
    setUploading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.replace('/my-tree/login');
  }

  const downloadCert = async () => {
    if (!donor) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = 297; const H = 210;
    doc.setFillColor(247, 245, 240); doc.rect(0, 0, W, H, "F");
    doc.setDrawColor(201, 168, 76); doc.setLineWidth(2); doc.rect(8, 8, W-16, H-16);
    doc.setLineWidth(0.5); doc.rect(12, 12, W-24, H-24);
    const corners = [[14,14],[W-14,14],[14,H-14],[W-14,H-14]] as [number,number][];
    doc.setFontSize(16); doc.setTextColor(201, 168, 76);
    corners.forEach(([x,y]) => doc.text("✦", x, y, { align:"center" }));
    doc.setFontSize(11); doc.setTextColor(151, 188, 98);
    doc.text("ECOTREE IMPACT FOUNDATION", W/2, 30, { align:"center" });
    doc.setFontSize(9); doc.setTextColor(150, 130, 80);
    doc.text("Every tree tracked. Every impact verified.", W/2, 38, { align:"center" });
    doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5); doc.line(40, 42, W-40, 42);
    doc.setFontSize(28); doc.setTextColor(44, 95, 45);
    doc.text("Certificate of Impact", W/2, 58, { align:"center" });
    doc.setFontSize(11); doc.setTextColor(80, 60, 20);
    doc.text("This certifies that", W/2, 72, { align:"center" });
    doc.setFontSize(26); doc.setTextColor(180, 140, 40);
    doc.text(donor.name, W/2, 88, { align:"center" });
    doc.setFontSize(11); doc.setTextColor(80, 60, 20);
    doc.text(`has planted ${donor.total_trees} trees with EcoTree Impact Foundation`, W/2, 100, { align:"center" });
    doc.text("across Bangalore, Karnataka, India", W/2, 108, { align:"center" });
    doc.setFillColor(44, 95, 45);
    doc.roundedRect(40, 116, 65, 24, 3, 3, "F");
    doc.roundedRect(116, 116, 65, 24, 3, 3, "F");
    doc.roundedRect(192, 116, 65, 24, 3, 3, "F");
    doc.setFontSize(14); doc.setTextColor(255, 255, 255);
    doc.text(`${donor.total_trees}`, 72, 126, { align:"center" });
    doc.text(`${donor.co2_kg} kg`, 148, 126, { align:"center" });
    doc.text(`${(donor.water_litres/1000).toFixed(1)}K L`, 224, 126, { align:"center" });
    doc.setFontSize(8); doc.setTextColor(216, 243, 220);
    doc.text("Trees Planted", 72, 134, { align:"center" });
    doc.text("CO₂ Offset", 148, 134, { align:"center" });
    doc.text("Water Saved", 224, 134, { align:"center" });
    doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5); doc.line(40, 148, W-40, 148);
    doc.setFontSize(9); doc.setTextColor(130, 100, 40);
    doc.text(`Donor ID: ${donor.id}   |   Member since: ${donor.since}   |   Issued: ${new Date().toLocaleDateString('en-IN', {month:'long',year:'numeric'})}`, W/2, 156, { align:"center" });
    doc.text("ISFR Standard · GPS Verified · 80G Approved · Section 8 Company", W/2, 163, { align:"center" });
    doc.setFontSize(8); doc.setTextColor(151, 188, 98);
    doc.text("ecotrees.org", W/2, 172, { align:"center" });
    doc.save(`EcoTree-Certificate-${donor.id}.pdf`);
  };

  const copyReferral = () => {
    if (!donor) return;
    navigator.clipboard.writeText(`https://ecotrees.org/ref/${donor.referral_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!donor) return;
    const text = encodeURIComponent(`🌳 I've planted ${donor.total_trees} trees with EcoTree Impact Foundation!\n🌿 ${donor.co2_kg} kg CO₂ offset · Growing in Bangalore\n💚 Join me: https://ecotrees.org/ref/${donor.referral_code}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const copyInstagram = () => {
    if (!donor) return;
    navigator.clipboard.writeText(`🌳 I've planted ${donor.total_trees} trees with @EcoTreeBangalore!\n🌿 ${donor.co2_kg} kg CO₂ offset · Growing in Bangalore 💚\n#EcoTree #PlantATree #Bangalore #GreenIndia #ClimateAction`);
    alert("Caption copied! Paste it in your Instagram post.");
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#1A3C34', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>🌳</div>
        <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)' }}>Loading your forest...</div>
      </div>
    </div>
  );
  if (!donor) return null;

  const treesWithGPS = myTrees.filter(t => t.lat && t.lng);
  const centerLat = treesWithGPS.length > 0 ? treesWithGPS.reduce((s,t) => s+(t.lat||0), 0)/treesWithGPS.length : 12.9716;
  const centerLng = treesWithGPS.length > 0 ? treesWithGPS.reduce((s,t) => s+(t.lng||0), 0)/treesWithGPS.length : 77.5946;

  // Group trees by tier
  const tierGroups: Record<string, DonorTree[]> = {}
  myTrees.forEach(t => {
    const key = t.tier || '1000'
    if (!tierGroups[key]) tierGroups[key] = []
    tierGroups[key].push(t)
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600;0,9..144,700;1,9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --clr-primary:#2C5F2D;--clr-moss:#97BC62;--clr-accent:#52B788;
          --clr-dark-bg:#1A3C34;--clr-cream:#F7F5F0;--clr-gold:#C9A84C;
          --font-display:'Fraunces',Georgia,serif;--font-body:'DM Sans',system-ui,sans-serif;
          --ease-out:cubic-bezier(0.16,1,0.3,1);
        }
        .mt-page{font-family:var(--font-body);background:#fff;overflow-x:hidden;}
        .mt-hero{background:var(--clr-dark-bg);background-image:radial-gradient(ellipse 60% 80% at 15% 50%,rgba(82,183,136,.1) 0%,transparent 65%);padding:1rem 1.5rem;}
        .mt-hero__inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap;}
        .mt-hero__left{display:flex;align-items:center;gap:1.25rem;flex:1;}
        .mt-hero__text{display:flex;flex-direction:column;gap:.5rem;}
        .mt-hero__eyebrow{font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--clr-moss);display:flex;align-items:center;gap:.5rem;}
        .live-dot{width:6px;height:6px;background:#4ade80;border-radius:50%;box-shadow:0 0 5px rgba(74,222,128,.9);animation:pulse 2s ease-in-out infinite;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.75)}}
        .mt-hero__h1{font-family:var(--font-display);font-size:clamp(1.2rem,2.5vw,1.8rem);font-weight:700;color:#fff;line-height:1.15;letter-spacing:-.02em;}
        .mt-hero__h1 em{font-style:italic;color:var(--clr-moss);}
        .mt-hero__sub{font-size:.95rem;color:rgba(255,255,255,.55);}
        .mt-hero__meta{display:flex;gap:1.25rem;flex-wrap:wrap;margin-top:.25rem;}
        .mt-hero__meta span{font-size:.75rem;color:rgba(255,255,255,.4);display:flex;align-items:center;gap:.3rem;}
        .mt-hero__meta strong{color:rgba(255,255,255,.7);}
        .cert-btn{display:inline-flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,var(--clr-gold),#a07820);color:#fff;font-family:var(--font-body);font-weight:700;font-size:.88rem;padding:.75rem 1.75rem;border-radius:999px;border:none;cursor:pointer;text-decoration:none;box-shadow:0 4px 20px rgba(201,168,76,.4);transition:box-shadow .2s,transform .2s;white-space:nowrap;}
        .cert-btn:hover{box-shadow:0 6px 28px rgba(201,168,76,.6);transform:translateY(-1px);}
        .mt-counters{background:var(--clr-dark-bg);border-top:1px solid rgba(255,255,255,.06);padding:1.5rem;}
        .mt-counters__inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;}
        @media(max-width:700px){.mt-counters__inner{grid-template-columns:repeat(2,1fr);}}
        .mt-counter{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.25rem 1rem;display:flex;flex-direction:column;align-items:center;gap:.3rem;}
        .mt-counter__icon{font-size:1.5rem;}
        .mt-counter__val{font-family:var(--font-display);font-size:clamp(1.4rem,3vw,2rem);font-weight:700;color:#fff;line-height:1;letter-spacing:-.02em;}
        .mt-counter__label{font-size:.7rem;font-weight:500;color:rgba(255,255,255,.45);letter-spacing:.05em;text-transform:uppercase;text-align:center;}
        .mt-counter__sub{font-size:.65rem;color:var(--clr-moss);font-weight:500;text-align:center;}
        .mt-map-section{background:var(--clr-cream);padding:3rem 0 0;}
        .mt-map-header{background:var(--clr-primary);border-radius:16px 16px 0 0;padding:1.25rem 2rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;max-width:1200px;margin:0 auto;}
        .mt-map-title{font-family:var(--font-display);font-size:1.2rem;font-weight:700;color:#fff;display:flex;align-items:center;gap:.5rem;}
        .mt-map-title span{font-size:.85rem;color:rgba(255,255,255,.5);font-family:var(--font-body);font-weight:400;}
        .style-toggle{display:flex;gap:.4rem;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:4px;}
        .style-btn{display:inline-flex;align-items:center;gap:.35rem;font-family:var(--font-body);font-size:.8rem;font-weight:600;color:rgba(255,255,255,.6);background:transparent;border:none;border-radius:999px;padding:.4rem .9rem;cursor:pointer;transition:all .25s var(--ease-out);}
        .style-btn.active{color:#fff;background:rgba(255,255,255,.15);}
        .mt-map-wrap{position:relative;height:420px;max-width:1200px;margin:0 auto;overflow:hidden;}
        @media(max-width:768px){.mt-map-wrap{height:340px;}}
        .mt-map-strip{max-width:1200px;margin:0 auto;background:var(--clr-primary);border-radius:0 0 16px 16px;padding:.6rem 1.5rem;font-size:.72rem;font-weight:600;color:rgba(255,255,255,.7);display:flex;align-items:center;gap:.75rem;}
        .mapboxgl-popup-content{background:rgba(255,255,255,.97)!important;border:1px solid #e5e7eb!important;border-radius:12px!important;padding:12px 16px!important;font-family:var(--font-body)!important;color:#1a1a1a!important;font-size:.8rem!important;min-width:170px;}
        .pu-title{font-weight:700;font-size:.9rem;margin-bottom:5px;color:var(--clr-primary);}
        .pu-row{display:flex;justify-content:space-between;gap:.75rem;font-size:.75rem;color:#6B7280;margin-top:3px;}
        .pu-row strong{color:#374151;}
        .pu-health{display:inline-block;padding:2px 8px;border-radius:999px;font-size:.7rem;font-weight:700;margin-top:5px;}
        .mt-section{padding:4rem 1.5rem;}
        .mt-section--cream{background:var(--clr-cream);}
        .mt-section--white{background:#fff;}
        .mt-section--dark{background:var(--clr-dark-bg);}
        .mt-inner{max-width:1200px;margin:0 auto;}
        .mt-eyebrow{font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--clr-accent);margin-bottom:.5rem;}
        .mt-h2{font-family:var(--font-display);font-size:clamp(1.5rem,3vw,2.2rem);font-weight:700;color:#1a1a1a;line-height:1.2;letter-spacing:-.015em;margin-bottom:.75rem;}
        .mt-h2--light{color:#fff;}
        .mt-sub{font-size:.95rem;color:#6B7280;line-height:1.6;max-width:560px;margin-bottom:2rem;}
        .tier-header{font-size:15px;font-weight:700;color:#1A3C34;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:2px solid #D8F3DC;display:flex;align-items:center;gap:8px;}
        .tier-badge{font-size:11px;font-weight:500;color:#6B7280;background:#f3f4f6;padding:2px 8px;border-radius:999px;}
        .tree-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;}
        @media(max-width:900px){.tree-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:600px){.tree-grid{grid-template-columns:1fr;}}
        .tree-card{border:1px solid #e5e7eb;border-radius:16px;padding:1.25rem;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.05);transition:box-shadow .2s,transform .2s;}
        .tree-card:hover{box-shadow:0 6px 20px rgba(0,0,0,.1);transform:translateY(-2px);}
        .photo-thumb{border-radius:8px;overflow:hidden;cursor:pointer;position:relative;display:flex;align-items:center;justify-content:center;font-size:1.5rem;transition:transform 0.15s;}
        .photo-thumb:hover{transform:scale(1.03);}
        .photo-thumb .lbl{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.55);color:white;font-size:10px;font-weight:600;padding:3px 6px;text-align:center;}
        .photo-thumb .zoom{position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.5);color:white;border-radius:4px;font-size:10px;padding:2px 5px;}
        .gps-btn{display:flex;align-items:center;gap:6px;padding:6px 8px;background:#f0fdf4;border-radius:6px;cursor:pointer;border:1px solid #86efac;transition:all 0.15s;width:100%;}
        .gps-btn:hover{background:#dcfce7;border-color:#4ade80;}
        .tree-card__occasion{display:inline-flex;align-items:center;gap:.3rem;margin-top:.5rem;font-size:.7rem;font-weight:600;background:var(--clr-cream);color:#374151;padding:2px 8px;border-radius:999px;}
        .tree-card__date{font-size:.68rem;color:#9CA3AF;margin-top:.35rem;}
        .timeline{display:flex;flex-direction:column;gap:0;}
        .tl-item{display:flex;gap:1.25rem;align-items:flex-start;padding-bottom:1.5rem;position:relative;}
        .tl-item:not(:last-child)::before{content:'';position:absolute;left:19px;top:38px;width:2px;height:calc(100% - 10px);background:linear-gradient(#e5e7eb,transparent);}
        .tl-dot{width:38px;height:38px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.1rem;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.1);}
        .tl-content{padding-top:.35rem;}
        .tl-title{font-weight:600;font-size:.9rem;color:#1a1a1a;}
        .tl-meta{font-size:.75rem;color:#6B7280;margin-top:2px;}
        .cert-preview{background:var(--clr-cream);border:2px solid var(--clr-gold);border-radius:20px;padding:3rem 2rem;text-align:center;position:relative;box-shadow:0 8px 40px rgba(201,168,76,.15);max-width:700px;margin:0 auto;}
        .cert-corner{position:absolute;font-size:1.4rem;color:var(--clr-gold);opacity:.6;line-height:1;}
        .cert-corner--tl{top:14px;left:18px;}.cert-corner--tr{top:14px;right:18px;}.cert-corner--bl{bottom:14px;left:18px;}.cert-corner--br{bottom:14px;right:18px;}
        .cert-org{font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--clr-moss);margin-bottom:.25rem;}
        .cert-tagline{font-size:.75rem;color:var(--clr-gold);margin-bottom:1rem;}
        .cert-divider{height:1px;background:linear-gradient(90deg,transparent,var(--clr-gold),transparent);margin:.75rem 0;}
        .cert-heading{font-family:var(--font-display);font-size:clamp(1.4rem,3vw,2rem);font-weight:700;color:var(--clr-primary);margin-bottom:1rem;}
        .cert-body{font-size:.9rem;color:#6B7280;line-height:1.8;margin-bottom:1.25rem;}
        .cert-name{font-family:var(--font-display);font-size:clamp(1.6rem,4vw,2.4rem);font-style:italic;font-weight:600;color:var(--clr-gold);margin:.25rem 0;line-height:1.2;}
        .cert-stats{display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;margin:1.25rem 0;}
        .cert-stat{background:var(--clr-primary);color:#fff;border-radius:12px;padding:.75rem 1.25rem;display:flex;flex-direction:column;align-items:center;gap:.2rem;min-width:90px;}
        .cert-stat__val{font-family:var(--font-display);font-size:1.3rem;font-weight:700;line-height:1;}
        .cert-stat__label{font-size:.65rem;font-weight:500;opacity:.75;text-transform:uppercase;letter-spacing:.05em;}
        .cert-footer{font-size:.7rem;color:#9CA3AF;margin-top:1rem;line-height:1.8;}
        .cert-id{display:inline-block;background:var(--clr-cream);border:1px solid var(--clr-gold);border-radius:6px;padding:2px 10px;font-size:.7rem;font-weight:600;color:var(--clr-gold);margin-top:.5rem;letter-spacing:.06em;}
        .share-card{background:linear-gradient(135deg,#1B4332 0%,#2C5F2D 50%,#40916C 100%);border-radius:20px;padding:2rem;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap;}
        .share-card__preview{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:1.25rem 1.5rem;flex:1;min-width:220px;}
        .share-card__text{font-size:.9rem;color:#fff;line-height:1.7;font-weight:500;}
        .share-card__hashtags{font-size:.75rem;color:rgba(255,255,255,.5);margin-top:.5rem;}
        .share-btns{display:flex;flex-direction:column;gap:.75rem;min-width:180px;}
        .btn-whatsapp{display:flex;align-items:center;justify-content:center;gap:.5rem;background:#25D366;color:#fff;font-weight:700;font-size:.88rem;padding:.7rem 1.5rem;border-radius:999px;border:none;cursor:pointer;}
        .btn-instagram{display:flex;align-items:center;justify-content:center;gap:.5rem;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);color:#fff;font-weight:700;font-size:.88rem;padding:.7rem 1.5rem;border-radius:999px;border:none;cursor:pointer;}
        .occasion-chip{display:inline-flex;align-items:center;gap:.4rem;background:var(--clr-cream);border:1px solid #e5e7eb;border-radius:999px;padding:.5rem 1rem;font-size:.82rem;font-weight:600;color:#374151;cursor:pointer;transition:all .2s;text-decoration:none;}
        .referral-box{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;}
        .referral-link{font-family:'Courier New',monospace;font-size:.85rem;color:var(--clr-moss);letter-spacing:.04em;background:rgba(255,255,255,.04);padding:.4rem .75rem;border-radius:6px;border:1px solid rgba(151,188,98,.2);}
        .btn-copy{display:inline-flex;align-items:center;gap:.4rem;background:var(--clr-accent);color:#fff;font-weight:700;font-size:.82rem;padding:.55rem 1.25rem;border-radius:999px;border:none;cursor:pointer;}
        .btn-copy.copied{background:#22c55e;}
        .plant-cta{background:linear-gradient(135deg,#1B4332 0%,#2C5F2D 60%,#40916C 100%);border-radius:20px;padding:2.5rem 2rem;text-align:center;}
        .plant-cta h3{font-family:var(--font-display);font-size:clamp(1.3rem,2.5vw,1.8rem);font-weight:700;color:#fff;margin-bottom:.5rem;}
        .plant-cta p{font-size:.9rem;color:rgba(255,255,255,.6);margin-bottom:1.5rem;}
        .plant-cta__btns{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;}
        .btn-white{background:#fff;color:var(--clr-primary);font-weight:700;font-size:.88rem;padding:.7rem 1.75rem;border-radius:999px;border:none;cursor:pointer;text-decoration:none;display:inline-block;}
        .btn-outline-w{background:transparent;color:#fff;font-weight:600;font-size:.88rem;padding:.7rem 1.75rem;border-radius:999px;border:2px solid rgba(255,255,255,.4);cursor:pointer;text-decoration:none;display:inline-block;}
        .donor-avatar{width:56px;height:56px;border-radius:50%;border:3px solid rgba(151,188,98,0.5);object-fit:cover;cursor:pointer;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#2C5F2D;color:#97BC62;font-size:1.25rem;font-weight:700;font-family:var(--font-display);}
        .donor-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
        .photo-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;padding:1rem;}
        .photo-overlay-img{width:min(90vw,480px);aspect-ratio:4/3;border-radius:16px;object-fit:cover;position:relative;}
        .map-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem;}
        .map-card{width:min(90vw,360px);background:white;border-radius:20px;overflow:hidden;}
        .map-fake{height:160px;background:linear-gradient(135deg,#1a3c34,#2c5f2d,#52b788);position:relative;display:flex;align-items:center;justify-content:center;}
        @media(max-width:768px){
          .mt-hero__inner{flex-direction:column;align-items:flex-start;}
          .share-card{flex-direction:column;}
          .share-btns{flex-direction:row;min-width:auto;}
          .tree-grid{grid-template-columns:1fr;}
        }
      `}</style>

      <main className="mt-page">

        {/* ADMIN BANNER */}
        {isAdminView && (
          <div style={{ background:'#1A3C34', borderBottom:'3px solid #97BC62', padding:'0.75rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ fontSize:'18px' }}>👁</span>
              <div>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#97BC62' }}>Admin View — {adminViewDonorName}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)' }}>{donor.email} · {donor.total_trees} trees · Read-only</div>
              </div>
            </div>
            <button onClick={() => window.close()} style={{ padding:'6px 14px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'8px', color:'white', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>← Close Tab</button>
          </div>
        )}

        {/* HERO */}
        <section className="mt-hero">
          <div className="mt-hero__inner">
            <div className="mt-hero__left">
              <div className="donor-avatar" onClick={() => !isAdminView && photoRef.current?.click()} title={isAdminView ? donor.name : "Click to update photo"}>
                {photoUrl ? <img src={photoUrl} alt={donor.first_name} /> : donor.first_name[0].toUpperCase()}
              </div>
              {!isAdminView && <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display:'none' }} />}
              <div className="mt-hero__text">
                <div className="mt-hero__eyebrow"><span className="live-dot" /> My EcoTree Dashboard{uploading && <span style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.4)' }}>Uploading...</span>}</div>
                <h1 className="mt-hero__h1">{donor.first_name}, your forest is <em>growing</em> 🌳</h1>
                <p className="mt-hero__sub">{donor.total_trees} trees planted · {donor.co2_kg} kg CO₂ offset · {donor.location}</p>
                <div className="mt-hero__meta">
                  <span>🪪 <strong>{donor.id}</strong></span>
                  <span>📅 Member since <strong>{donor.since}</strong></span>
                  <span>📍 <strong>{donor.location}</strong></span>
                  {!isAdminView && <span onClick={handleLogout} style={{ cursor:'pointer', color:'rgba(255,255,255,0.4)', marginLeft:'1rem' }}>Sign out</span>}
                </div>
              </div>
            </div>
            <button className="cert-btn" onClick={downloadCert}>⬇️ Download Certificate</button>
          </div>
        </section>

        {/* COUNTERS */}
        <section className="mt-counters">
          <div className="mt-counters__inner">
            {[
              { icon:'🌳', val:donor.total_trees,                            label:'My Trees',           sub:'GPS verified'         },
              { icon:'🌿', val:`${donor.co2_kg} kg`,                         label:'CO₂ Offset',         sub:'ISFR · 22 kg/tree/yr' },
              { icon:'💧', val:`${(donor.water_litres/1000).toFixed(1)}K L`, label:'Water Saved',        sub:'3,785 L per tree/yr'  },
              { icon:'🌍', val:`${donor.km_equivalent.toLocaleString()} km`, label:'Driving Equivalent', sub:'less CO₂ on roads'    },
            ].map(c => (
              <div className="mt-counter" key={c.label}>
                <span className="mt-counter__icon">{c.icon}</span>
                <span className="mt-counter__val">{c.val}</span>
                <span className="mt-counter__label">{c.label}</span>
                <span className="mt-counter__sub">{c.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* MAP */}
        {treesWithGPS.length > 0 && (
          <section className="mt-map-section">
            <div className="mt-map-header">
              <div className="mt-map-title">🗺️ My Trees on the Map<span>· {donor.total_trees} locations</span></div>
              <div className="style-toggle">
                <button className={`style-btn${mapStyle==="light"?" active":""}`} onClick={() => setMapStyle("light")}>🗺️ Street</button>
                <button className={`style-btn${mapStyle==="satellite"?" active":""}`} onClick={() => setMapStyle("satellite")}>🛰️ Satellite</button>
              </div>
            </div>
            <div className="mt-map-wrap">
              <Map mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                initialViewState={{ longitude:centerLng, latitude:centerLat, zoom:11 }}
                style={{ width:'100%', height:'100%' }} mapStyle={MAP_STYLES[mapStyle]}>
                <NavigationControl position="bottom-right" />
                {treesWithGPS.map((t) => (
                  <Marker key={t.id} longitude={t.lng!} latitude={t.lat!} anchor="bottom"
                    onClick={e => { e.originalEvent.stopPropagation(); setPopup(t); }}>
                    <div style={{ width:34, height:34, background:SPECIES_COLOR[t.species]||"#2C5F2D", borderRadius:"50% 50% 50% 0", transform:"rotate(-45deg)", border:"2.5px solid rgba(255,255,255,.95)", boxShadow:t.pulse?"0 0 0 8px rgba(44,95,45,.2),0 3px 10px rgba(0,0,0,.3)":"0 3px 10px rgba(0,0,0,.25)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                      <span style={{ transform:"rotate(45deg)", fontSize:15 }}>{SPECIES_EMOJI[t.species]||'🌱'}</span>
                    </div>
                  </Marker>
                ))}
                {popup && (
                  <Popup longitude={popup.lng} latitude={popup.lat} anchor="bottom" offset={48} onClose={() => setPopup(null)} closeOnClick={false}>
                    <div className="pu-title">{SPECIES_EMOJI[popup.species]||'🌱'} {popup.species}</div>
                    <div className="pu-row"><span>Zone</span><strong>{popup.zone}</strong></div>
                    <div className="pu-row"><span>Planted</span><strong>{popup.planted}</strong></div>
                    <div><span className="pu-health" style={{ background:HEALTH_COLOR(popup.health)+"22", color:HEALTH_COLOR(popup.health) }}>Health: {popup.health}% {popup.health>=85?"🟢":popup.health>=70?"🟡":"🔴"}</span></div>
                  </Popup>
                )}
              </Map>
            </div>
            <div className="mt-map-strip"><span className="live-dot" />All {treesWithGPS.length} trees GPS-verified · Click any pin for details</div>
          </section>
        )}

        {/* ── TREE CARDS — grouped by tier ── */}
        <section className="mt-section mt-section--cream">
          <div className="mt-inner">
            <p className="mt-eyebrow">Your Forest</p>
            <h2 className="mt-h2">All {donor.total_trees} of your trees</h2>
            <p className="mt-sub">Your trees update as they are planted and verified.</p>

            {myTrees.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem', color:'#6B7280' }}>
                <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>🌱</div>
                <div style={{ fontSize:'16px', fontWeight:600 }}>No trees yet</div>
                {!isAdminView && <a href="/donate" style={{ color:'#2C5F2D', fontWeight:600 }}>Plant your first tree →</a>}
              </div>
            ) : (
              <>
                {TIER_ORDER.filter(k => tierGroups[k]?.length > 0).map(tierKey => (
                  <div key={tierKey} style={{ marginBottom:'2.5rem' }}>
                    {/* Tier section header */}
                    <div className="tier-header">
                      {TIER_LABELS[tierKey]}
                      <span className="tier-badge">{tierGroups[tierKey].length} tree{tierGroups[tierKey].length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="tree-grid">
                      {tierGroups[tierKey].map(t => (
                        <div key={t.id} className="tree-card">

                          {/* Tree header */}
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                            <span style={{ fontSize:'1.5rem' }}>{SPECIES_EMOJI[t.species]||'🌱'}</span>
                            <div>
                              <div style={{ fontSize:'14px', fontWeight:700, color:'#1A1A1A' }}>{t.species}</div>
                              <div style={{ fontSize:'11px', fontFamily:'monospace', color:'#97BC62' }}>{t.tree_id}</div>
                              {/* Partner name for joint trees */}
                              {t.tree_type === 'Joint Tree' && t.partner_name && (
                                <div style={{ fontSize:'11px', color:'#F59E0B', fontWeight:600, marginTop:'2px' }}>
                                  🤝 with {t.partner_name}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* PENDING */}
                          {t.status === 'PENDING' && (
                            <div style={{ background:'#fef9c3', border:'1px solid #fde68a', borderRadius:'10px', padding:'14px', textAlign:'center', marginBottom:'10px' }}>
                              <div style={{ fontSize:'1.75rem', marginBottom:'6px' }}>⏳</div>
                              <div style={{ fontSize:'13px', fontWeight:600, color:'#92400e', marginBottom:'4px' }}>Being Prepared</div>
                              <div style={{ fontSize:'12px', color:'#a16207', lineHeight:1.5 }}>Your tree is being prepared for plantation. We will notify you once it is assigned to a field worker.</div>
                            </div>
                          )}

                          {/* ASSIGNED */}
                          {t.status === 'ASSIGNED' && (
                            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'10px', padding:'14px', textAlign:'center', marginBottom:'10px' }}>
                              <div style={{ fontSize:'1.75rem', marginBottom:'6px' }}>👷</div>
                              <div style={{ fontSize:'13px', fontWeight:600, color:'#1e40af', marginBottom:'4px' }}>Assigned to Field Worker</div>
                              <div style={{ fontSize:'12px', color:'#1d4ed8', lineHeight:1.5 }}>A field worker has been assigned to plant your tree. Plantation will happen within 7 days.</div>
                            </div>
                          )}

                          {/* PLANTED */}
                          {t.status === 'PLANTED' && (
                            <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:'10px', padding:'14px', textAlign:'center', marginBottom:'10px' }}>
                              <div style={{ fontSize:'1.75rem', marginBottom:'6px' }}>🌱</div>
                              <div style={{ fontSize:'13px', fontWeight:600, color:'#166534', marginBottom:'4px' }}>Planted — Awaiting Verification</div>
                              <div style={{ fontSize:'12px', color:'#15803d', lineHeight:1.5 }}>Your tree has been planted! Our team is verifying photos and GPS. You will receive an email once verified.</div>
                            </div>
                          )}

                          {/* VERIFIED */}
                          {(t.status === 'VERIFIED' || t.status === 'HEALTHY') && (
                            <>
                              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                                <div className="photo-thumb"
                                  style={{ height:'90px', background: t.before_photo_url ? `url(${t.before_photo_url}) center/cover` : 'linear-gradient(135deg,#374151,#6b7280)' }}
                                  onClick={() => t.before_photo_url && setPhotoPopup({ url: t.before_photo_url, label: `Before planting · ${t.species}`, treeId: t.tree_id })}>
                                  {!t.before_photo_url && '🏗️'}
                                  <div className="lbl">Before</div>
                                  {t.before_photo_url && <div className="zoom">🔍</div>}
                                </div>
                                <div className="photo-thumb"
                                  style={{ height:'90px', background: t.after_photo_url ? `url(${t.after_photo_url}) center/cover` : 'linear-gradient(135deg,#2d6a4f,#52b788)' }}
                                  onClick={() => t.after_photo_url && setPhotoPopup({ url: t.after_photo_url, label: `After planting · ${t.species}`, treeId: t.tree_id })}>
                                  {!t.after_photo_url && '🌳'}
                                  <div className="lbl">After</div>
                                  {t.after_photo_url && <div className="zoom">🔍</div>}
                                </div>
                              </div>
                              <div style={{ fontSize:'12px', color:'#6B7280', marginBottom:'6px' }}>📍 {t.zone}</div>
                              <div style={{ background:'#f3f4f6', borderRadius:'999px', height:'5px', overflow:'hidden', marginBottom:'4px' }}>
                                <div style={{ width:`${t.health}%`, height:'100%', background:HEALTH_COLOR(t.health), borderRadius:'999px' }} />
                              </div>
                              <div style={{ fontSize:'11px', fontWeight:600, color:HEALTH_COLOR(t.health), marginBottom:'8px' }}>
                                Health {t.health}% {t.health>=85?"🟢":t.health>=70?"🟡":"🔴"}
                              </div>
                              {t.lat && t.lng && (
                                <button className="gps-btn" onClick={() => setMapPopup({ lat: t.lat!, lng: t.lng!, tree: t })}>
                                  <span style={{ fontSize:'12px' }}>📍</span>
                                  <span style={{ fontFamily:'monospace', fontSize:'10px', color:'#2C5F2D', fontWeight:600 }}>{t.lat.toFixed(4)}° N, {t.lng.toFixed(4)}° E</span>
                                  <span style={{ marginLeft:'auto', fontSize:'10px', color:'#2C5F2D' }}>Map →</span>
                                </button>
                              )}
                              <div style={{ marginTop:'8px', textAlign:'center' }}>
                                <a href={`/tree/${t.tree_id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:'11px', color:'#2C5F2D', fontWeight:600, textDecoration:'none' }}>View tree profile →</a>
                              </div>
                            </>
                          )}

                          <div className="tree-card__occasion">{getOccasionIcon(t.occasion)} {t.occasion}</div>
                          <div className="tree-card__date">Planted {t.planted}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        {/* TIMELINE */}
        {timeline.length > 0 && (
          <section className="mt-section mt-section--white">
            <div className="mt-inner">
              <p className="mt-eyebrow">Your Story</p>
              <h2 className="mt-h2">Why each tree was planted</h2>
              <p className="mt-sub">Every tree has a memory behind it.</p>
              <div className="timeline">
                {timeline.map((o, i) => (
                  <div key={i} className="tl-item">
                    <div className="tl-dot" style={{ background:o.color+"22", borderColor:o.color }}>{o.icon}</div>
                    <div className="tl-content">
                      <div className="tl-title">{o.occasion} · {o.species}</div>
                      <div className="tl-meta">📍 {o.zone} · {o.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CERTIFICATE */}
        <section className="mt-section mt-section--cream">
          <div className="mt-inner">
            <p className="mt-eyebrow">Your Impact Certificate</p>
            <h2 className="mt-h2">Download your certificate</h2>
            <p className="mt-sub">A premium PDF certificate — share on LinkedIn or frame it.</p>
            <div className="cert-preview" ref={certRef}>
              <span className="cert-corner cert-corner--tl">✦</span>
              <span className="cert-corner cert-corner--tr">✦</span>
              <span className="cert-corner cert-corner--bl">✦</span>
              <span className="cert-corner cert-corner--br">✦</span>
              <div className="cert-org">EcoTree Impact Foundation</div>
              <div className="cert-tagline">Every tree tracked. Every impact verified.</div>
              <div className="cert-divider" />
              <div className="cert-heading">Certificate of Impact</div>
              <div className="cert-body">This certifies that</div>
              <div className="cert-name">{donor.name}</div>
              <div className="cert-body">has planted trees with EcoTree Impact Foundation<br />across Bangalore, Karnataka, India</div>
              <div className="cert-stats">
                <div className="cert-stat"><span className="cert-stat__val">{donor.total_trees}</span><span className="cert-stat__label">Trees</span></div>
                <div className="cert-stat"><span className="cert-stat__val">{donor.co2_kg} kg</span><span className="cert-stat__label">CO₂ Offset</span></div>
                <div className="cert-stat"><span className="cert-stat__val">{(donor.water_litres/1000).toFixed(1)}K L</span><span className="cert-stat__label">Water Saved</span></div>
              </div>
              <div className="cert-divider" />
              <div className="cert-footer">Member since {donor.since} · ISFR Standard · GPS Verified · 80G Approved</div>
              <div className="cert-id">{donor.id}</div>
            </div>
            <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
              <button className="cert-btn" onClick={downloadCert}>⬇️ Download PDF Certificate</button>
            </div>
          </div>
        </section>

        {/* SOCIAL SHARE */}
        {!isAdminView && (
          <section className="mt-section mt-section--white">
            <div className="mt-inner">
              <p className="mt-eyebrow">Share Your Impact</p>
              <h2 className="mt-h2">Inspire others to plant</h2>
              <div className="share-card">
                <div className="share-card__preview">
                  <div className="share-card__text">🌳 I&apos;ve planted {donor.total_trees} trees with EcoTree Impact Foundation!<br />🌿 {donor.co2_kg} kg CO₂ offset · Growing in Bangalore<br />💚 Join me: ecotrees.org/ref/{donor.referral_code}</div>
                  <div className="share-card__hashtags">#EcoTree #PlantATree #Bangalore #GreenIndia #ClimateAction</div>
                </div>
                <div className="share-btns">
                  <button className="btn-whatsapp" onClick={shareWhatsApp}>💬 Share on WhatsApp</button>
                  <button className="btn-instagram" onClick={copyInstagram}>📸 Copy for Instagram</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PLANT MORE */}
        {!isAdminView && (
          <section className="mt-section mt-section--cream">
            <div className="mt-inner">
              <p className="mt-eyebrow">Grow Your Forest</p>
              <h2 className="mt-h2">Add more trees</h2>
              <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap', marginBottom:'2rem' }}>
                {[{icon:'🎂',label:'Birthday'},{icon:'💍',label:'Anniversary'},{icon:'🙏',label:'Memorial'},{icon:'🪔',label:'Diwali'},{icon:'🎆',label:'New Year'},{icon:'🌍',label:'Earth Day'},{icon:'🏢',label:'Corporate'},{icon:'🎁',label:'Gift a Tree'}].map(o => (
                  <a key={o.label} href="/donate" className="occasion-chip">{o.icon} {o.label}</a>
                ))}
              </div>
              <div className="plant-cta">
                <h3>Your forest is at {donor.total_trees} trees — keep growing 🌱</h3>
                <p>Every tree you add appears on your personal map and updates your certificate automatically.</p>
                <div className="plant-cta__btns">
                  <a href="/donate" className="btn-white">🌳 Plant More Trees</a>
                  <a href="/dashboard" className="btn-outline-w">📊 Public Dashboard</a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* REFER */}
        {!isAdminView && (
          <section className="mt-section mt-section--dark">
            <div className="mt-inner">
              <p className="mt-eyebrow" style={{ color:'var(--clr-moss)' }}>Referral Programme</p>
              <h2 className="mt-h2 mt-h2--light">Every friend you refer plants a tree</h2>
              <div className="referral-box">
                <div>
                  <div style={{ fontSize:'.75rem', color:'rgba(255,255,255,.4)', marginBottom:'.35rem', fontWeight:600, textTransform:'uppercase' }}>Your referral link</div>
                  <div className="referral-link">ecotrees.org/ref/{donor.referral_code}</div>
                </div>
                <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
                  <button className={`btn-copy${copied?" copied":""}`} onClick={copyReferral}>{copied?"✅ Copied!":"📋 Copy Link"}</button>
                  <button className="btn-whatsapp" onClick={() => { const text = encodeURIComponent(`🌳 Join me on EcoTree!\nhttps://ecotrees.org/ref/${donor.referral_code}`); window.open(`https://wa.me/?text=${text}`,"_blank"); }}>💬 Share</button>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* PHOTO FULLSCREEN POPUP */}
      {photoPopup && (
        <div className="photo-overlay" onClick={() => setPhotoPopup(null)}>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Tap anywhere to close</div>
          <div style={{ position:'relative' }} onClick={e => e.stopPropagation()}>
            <img src={photoPopup.url} alt={photoPopup.label} className="photo-overlay-img" />
            <button onClick={() => setPhotoPopup(null)} style={{ position:'absolute', top:'-12px', right:'-12px', width:'28px', height:'28px', borderRadius:'50%', background:'#dc2626', border:'none', color:'white', fontSize:'14px', cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:'12px', padding:'10px 16px', color:'white', fontSize:'12px', textAlign:'center', width:'min(90vw,400px)' }}>
            <div style={{ fontWeight:600, color:'#97BC62', marginBottom:'4px' }}>{photoPopup.label}</div>
            <div style={{ fontFamily:'monospace', opacity:0.7 }}>{photoPopup.treeId}</div>
          </div>
        </div>
      )}

      {/* MAP POPUP */}
      {mapPopup && (
        <div className="map-overlay" onClick={() => setMapPopup(null)}>
          <div className="map-card" onClick={e => e.stopPropagation()}>
            <div className="map-fake">
              <svg width="100%" height="100%" style={{ position:'absolute', opacity:0.15 }}>
                <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0L0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#grid)"/>
              </svg>
              <div style={{ width:34, height:34, background:'#2C5F2D', borderRadius:'50% 50% 50% 0', transform:'rotate(-45deg)', border:'3px solid white', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 10px rgba(0,0,0,0.3)' }}>
                <span style={{ transform:'rotate(45deg)', fontSize:15 }}>🌳</span>
              </div>
              {mapPopup.tree.after_photo_url && (
                <div style={{ position:'absolute', top:8, right:8, width:52, height:52, borderRadius:8, border:'2px solid white', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.3)' }}>
                  <img src={mapPopup.tree.after_photo_url} alt="tree" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
              )}
              <div style={{ position:'absolute', bottom:6, left:8, fontSize:'10px', color:'rgba(255,255,255,0.6)', background:'rgba(0,0,0,0.3)', padding:'2px 6px', borderRadius:4 }}>🛰️ Satellite view</div>
            </div>
            <div style={{ padding:'1rem' }}>
              <div style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A', marginBottom:'4px' }}>
                {SPECIES_EMOJI[mapPopup.tree.species]||'🌳'} {mapPopup.tree.species} · {mapPopup.tree.zone}
              </div>
              <div style={{ fontFamily:'monospace', fontSize:'11px', color:'#2C5F2D', fontWeight:600, background:'#f0fdf4', padding:'6px 10px', borderRadius:6, marginBottom:'12px' }}>
                {mapPopup.lat.toFixed(6)}° N, {mapPopup.lng.toFixed(6)}° E
              </div>
              <a href={`https://maps.google.com/?q=${mapPopup.lat},${mapPopup.lng}`} target="_blank" rel="noopener noreferrer"
                style={{ display:'block', width:'100%', padding:'10px', background:'#2C5F2D', color:'white', borderRadius:8, fontSize:'13px', fontWeight:600, textDecoration:'none', textAlign:'center', marginBottom:8 }}>
                🗺️ Open in Google Maps
              </a>
              <button onClick={() => setMapPopup(null)} style={{ width:'100%', padding:'8px', background:'transparent', color:'#6B7280', border:'1px solid #e5e7eb', borderRadius:8, fontSize:'13px', cursor:'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
