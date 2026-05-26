import { useState, useRef, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lhgasfzrddtmsoohqbnb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZ2FzZnpyZGR0bXNvb2hxYm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NjM1NzAsImV4cCI6MjA5NTMzOTU3MH0.AONTJ-gAR8Qjbu8KUFVY7S26wozjVp606vLCzUH1gmw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CLOUDINARY_CLOUD = "dn8exsusx";
const CLOUDINARY_PRESET = "maria_taqueria";

const ADMIN_PIN = "1234";

const COLOR_PALETTES = [
  { name: "Dia de Muertos", primary: "#7B2D8B", bg: "#1a0a2e", accent: "#FF6B35", text: "#FFD700" },
  { name: "Mexico Verde", primary: "#3F7D3A", bg: "#FFF8EC", accent: "#E63946", text: "#1a1a1a" },
  { name: "Fuego", primary: "#E63946", bg: "#1a0a0a", accent: "#FF6B35", text: "#FFD700" },
  { name: "Oceano", primary: "#0077B6", bg: "#03045E", accent: "#00B4D8", text: "#ffffff" },
  { name: "Dorado", primary: "#B5830A", bg: "#1C1C1C", accent: "#FFD700", text: "#ffffff" },
  { name: "Rosa Mexicano", primary: "#C2185B", bg: "#FCE4EC", accent: "#7B1FA2", text: "#1a1a1a" },
];

const DEFAULT_PALETTE = COLOR_PALETTES[0];

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f5ede0'/%3E%3Ctext x='40' y='46' font-size='28' text-anchor='middle' fill='%23c8b89a'%3E🌮%3C/text%3E%3C/svg%3E";

const INITIAL_ITEMS = [
  { name: "Agua de Jamaica", description: "Refrescante agua fresca de flor de jamaica, servida bien fria.", price: 95, category: "Bebidas", spicy: false, available: true, image: "" },
  { name: "Agua de Horchata", description: "Tradicional agua de arroz con canela, dulce y cremosa.", price: 95, category: "Bebidas", spicy: false, available: true, image: "" },
  { name: "Cerveza Corona", description: "Cerveza mexicana bien fria, perfecta para acompanar tus tacos.", price: 175, category: "Bebidas", spicy: false, available: true, image: "" },
  { name: "Guacamole", description: "Aguacate fresco con tomate, cebolla, cilantro y limon.", price: 150, category: "Entradas", spicy: false, available: true, image: "" },
  { name: "Elotes Asados", description: "Maiz a la parrilla con mantequilla, queso cotija y chile.", price: 120, category: "Entradas", spicy: true, available: true, image: "" },
  { name: "Nachos con Queso", description: "Totopos crujientes banados en queso derretido y jalapenos.", price: 160, category: "Entradas", spicy: true, available: true, image: "" },
  { name: "Taco de Carne Asada", description: "Res a la parrilla con guacamole, cebolla y cilantro.", price: 195, category: "Tacos", spicy: false, available: true, image: "" },
  { name: "Taco de Pollo", description: "Pollo desmenuzado con salsa verde, queso fresco y crema.", price: 170, category: "Tacos", spicy: false, available: true, image: "" },
  { name: "Taco de Chorizo", description: "Chorizo mexicano artesanal con papa, queso y salsa roja.", price: 185, category: "Tacos", spicy: true, available: true, image: "" },
  { name: "Taco de Camaron", description: "Camarones salteados con chipotle, repollo y pico de gallo.", price: 210, category: "Tacos", spicy: true, available: true, image: "" },
  { name: "Churros con Chocolate", description: "Churros crujientes con azucar y canela, chocolate caliente.", price: 130, category: "Postres", spicy: false, available: true, image: "" },
  { name: "Flan Casero", description: "Flan artesanal de vainilla con caramelo, receta de la abuela.", price: 110, category: "Postres", spicy: false, available: true, image: "" },
];

const CATEGORIES = ["Bebidas", "Entradas", "Tacos", "Mexico", "Especialidades", "Postres"];

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  const res = await fetch("https://api.cloudinary.com/v1_1/" + CLOUDINARY_CLOUD + "/image/upload", { method: "POST", body: formData });
  const data = await res.json();
  return data.secure_url;
}

function fmtDate(ts) {
  return new Date(ts).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" });
}

function SpicyBadge() {
  return <span style={{ background: "#FF6B35", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 20, padding: "3px 9px", display: "inline-flex", alignItems: "center", gap: 3 }}>🔥 Picante</span>;
}

function Toggle({ on, onClick, primary }) {
  return (
    <div onClick={onClick} style={{ width: 44, height: 24, borderRadius: 12, background: on ? primary : "#555", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: on ? 22 : 2, transition: "left .2s" }} />
    </div>
  );
}

function ImageUploadBox({ value, onChange, size = 80, radius = 14 }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: "#2a1a3e", overflow: "hidden", flexShrink: 0, cursor: "pointer", border: "2px dashed #7B2D8B", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
      onClick={() => ref.current.click()}>
      {uploading ? <div style={{ fontSize: 12, color: "#aaa" }}>...</div> :
        value ? <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
        <span style={{ fontSize: size * 0.35, opacity: 0.5 }}>📷</span>}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
        if (e.target.files[0]) { setUploading(true); const url = await uploadToCloudinary(e.target.files[0]); onChange(url); setUploading(false); }
      }} />
    </div>
  );
}

function Spinner({ primary }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
      <div style={{ width: 40, height: 40, border: "4px solid " + primary + "33", borderTop: "4px solid " + primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}

function ItemCard({ item, onAdd, palette }) {
  return (
    <div style={{ background: palette.bg === "#1a0a2e" ? "#2a1040" : "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.3)", display: "flex", opacity: item.available ? 1 : 0.4, border: "1px solid " + palette.primary + "44" }}>
      <div style={{ width: 110, height: 110, flexShrink: 0, background: "#1a0a2e", overflow: "hidden", position: "relative" }}>
        <img src={item.image || PLACEHOLDER} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1, padding: "12px 14px 12px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: palette.text, lineHeight: 1.3 }}>{item.name}</span>
            {item.spicy && <SpicyBadge />}
          </div>
          <p style={{ fontSize: 11, color: palette.text + "99", margin: 0, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.description}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ color: palette.accent, fontWeight: 900, fontSize: 17 }}>RD${item.price}</span>
          {item.available && (
            <button onClick={() => onAdd(item)} style={{ width: 34, height: 34, borderRadius: "50%", background: palette.primary, border: "none", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 300, boxShadow: "0 4px 12px " + palette.primary + "66" }}>+</button>
          )}
        </div>
      </div>
    </div>
  );
}

function CategorySection({ category, items, onAdd, palette }) {
  const [open, setOpen] = useState(true);
  const catItems = items.filter(i => i.category === category && i.available);
  if (catItems.length === 0) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: palette.primary + "22", cursor: "pointer", borderLeft: "4px solid " + palette.primary }}>
        <span style={{ fontWeight: 900, fontSize: 16, color: palette.text, letterSpacing: 1, textTransform: "uppercase" }}>{category}</span>
        <span style={{ color: palette.primary, fontSize: 20, fontWeight: 900 }}>{open ? "−" : "+"}</span>
      </div>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 16px" }}>
          {catItems.map(item => <ItemCard key={item.id} item={item} onAdd={onAdd} palette={palette} />)}
        </div>
      )}
    </div>
  );
}

function CartDrawer({ cart, onClose, onSend, onRemove, onAdd, palette }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: palette.bg, borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", maxHeight: "85vh", overflowY: "auto", border: "1px solid " + palette.primary + "44" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: palette.text }}>Tu pedido 🛒</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: palette.text }}>✕</button>
        </div>
        {cart.length === 0
          ? <p style={{ textAlign: "center", color: palette.text + "66", padding: "32px 0" }}>Tu carrito esta vacio</p>
          : <>
            {cart.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid " + palette.primary + "33" }}>
                <div style={{ width: 50, height: 50, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                  <img src={item.image || PLACEHOLDER} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: palette.text }}>{item.name}</div>
                  <div style={{ color: palette.accent, fontWeight: 600, fontSize: 12 }}>RD${item.price} c/u</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => onRemove(item.id)} style={{ width: 28, height: 28, borderRadius: "50%", background: "#fee2e2", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: 900, fontSize: 16 }}>−</button>
                  <span style={{ fontWeight: 800, minWidth: 20, textAlign: "center", color: palette.text }}>{item.qty}</span>
                  <button onClick={() => onAdd(item)} style={{ width: 28, height: 28, borderRadius: "50%", background: palette.primary + "33", border: "none", color: palette.primary, cursor: "pointer", fontWeight: 900, fontSize: 16 }}>+</button>
                </div>
                <span style={{ fontWeight: 800, color: palette.accent, minWidth: 60, textAlign: "right", fontSize: 13 }}>RD${item.price * item.qty}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 20px", fontWeight: 900, fontSize: 18, color: palette.text }}>
              <span>Total</span><span style={{ color: palette.accent }}>RD${total}</span>
            </div>
            <button onClick={onSend} style={{ width: "100%", padding: 16, background: "#25D366", border: "none", borderRadius: 14, color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              📱 Ordenar por WhatsApp
            </button>
          </>
        }
      </div>
    </div>
  );
}

function AdminPanel({ items, setItems, orders, identity, setIdentity, onClose, onSaveItem, onDeleteItem, onSaveIdentity, palette }) {
  const [tab, setTab] = useState("platos");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const openEdit = (item) => { setEditing(item.id); setForm({ ...item }); };
  const openNew = () => { setEditing("new"); setForm({ name: "", description: "", price: "", category: "Tacos", spicy: false, available: true, image: "" }); };
  const saveItem = async () => { setSaving(true); await onSaveItem(editing, { ...form, price: Number(form.price) }); setSaving(false); setEditing(null); };

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const itemCounts = {};
  orders.forEach(o => o.items.forEach(i => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty; }));
  const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const exportExcel = () => {
    const rows = [];
    orders.forEach(o => o.items.forEach(item => rows.push({ "Fecha": fmtDate(o.timestamp), "Orden": o.id, "Plato": item.name, "Categoria": item.category, "Cantidad": item.qty, "Precio": item.price, "Subtotal": item.price * item.qty, "Total": o.total })));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ordenes");
    XLSX.writeFile(wb, "ordenes_maria_taqueria.xlsx");
  };

  const tabs = [{ id: "platos", label: "🍽 Platos" }, { id: "ordenes", label: "📊 Ordenes" }, { id: "identidad", label: "🎨 Identidad" }];

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", fontFamily: "Georgia, serif", color: "#fff" }}>
      <div style={{ background: "#1a1a1a", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, borderBottom: "2px solid " + palette.primary }}>
        <div>
          <div style={{ fontSize: 11, color: "#aaa", letterSpacing: 2 }}>PANEL ADMIN</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: palette.accent }}>Maria Taqueria</div>
        </div>
        <div style={{display:"flex",gap:8}}><button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ background: "#333", border: "none", color: "#aaa", borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>🗑 Cache</button><button onClick={onClose} style={{ background: palette.primary, border: "none", color: "#fff", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Ver menu →</button></div>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #333", background: "#111", padding: "0 16px" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "14px 16px", border: "none", background: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", color: tab === t.id ? palette.accent : "#666", borderBottom: tab === t.id ? "3px solid " + palette.accent : "3px solid transparent", marginBottom: -2 }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ padding: "20px 16px 80px" }}>
        {tab === "platos" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: "#888", fontSize: 13 }}>{items.length} platos</span>
              <button onClick={openNew} style={{ background: palette.primary, color: "#fff", border: "none", borderRadius: 12, padding: "10px 18px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>+ Nuevo plato</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map(item => (
                <div key={item.id} style={{ background: "#1a1a1a", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, border: "1px solid #333" }}>
                  <div style={{ width: 54, height: 54, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#2a2a2a" }}>
                    <img src={item.image || PLACEHOLDER} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#fff" }}>{item.name}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                      <span style={{ fontSize: 11, background: palette.primary + "33", borderRadius: 8, padding: "2px 8px", color: palette.accent }}>{item.category}</span>
                      {item.spicy && <span>🔥</span>}
                    </div>
                    <div style={{ color: palette.accent, fontWeight: 800, fontSize: 13, marginTop: 2 }}>RD${item.price}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Toggle on={item.available} onClick={() => onSaveItem(item.id, { ...item, available: !item.available })} primary={palette.primary} />
                    <button onClick={() => openEdit(item)} style={{ background: "#333", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#fff" }}>✏️</button>
                    <button onClick={() => onDeleteItem(item.id)} style={{ background: "#3a1a1a", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === "ordenes" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[["Total ordenes", orders.length, "📋"], ["Ingresos", "RD$" + totalRevenue.toLocaleString(), "💰"]].map(([label, val, icon]) => (
                <div key={label} style={{ background: "#1a1a1a", borderRadius: 14, padding: 16, border: "1px solid " + palette.primary + "44" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: palette.accent }}>{val}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{label}</div>
                </div>
              ))}
            </div>
            {topItems.length > 0 && (
              <div style={{ background: "#1a1a1a", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid #333" }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: palette.accent }}>🏆 Mas pedidos</div>
                {topItems.map(([name, qty], i) => (
                  <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < topItems.length - 1 ? "1px solid #333" : "none" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#ddd" }}>#{i + 1} {name}</span>
                    <span style={{ fontWeight: 800, color: palette.accent, fontSize: 13 }}>{qty} uds.</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={exportExcel} style={{ width: "100%", padding: 15, background: "#1a7a3c", border: "none", borderRadius: 14, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 20 }}>
              📥 Exportar a Excel
            </button>
            {orders.length === 0
              ? <p style={{ textAlign: "center", color: "#555", padding: "32px 0" }}>Sin ordenes aun</p>
              : [...orders].reverse().map(order => (
                <div key={order.id} style={{ background: "#1a1a1a", borderRadius: 14, padding: 14, marginBottom: 10, border: "1px solid #333" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>Orden #{order.id}</span>
                    <span style={{ fontSize: 11, color: "#666" }}>{fmtDate(order.timestamp)}</span>
                  </div>
                  {order.items.map((i, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", padding: "3px 0" }}>
                      <span>{i.name} x {i.qty}</span><span>RD${i.price * i.qty}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid #333", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 13 }}>
                    <span style={{ color: "#fff" }}>Total</span><span style={{ color: palette.accent }}>RD${order.total}</span>
                  </div>
                </div>
              ))
            }
          </>
        )}
        {tab === "identidad" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#1a1a1a", borderRadius: 18, padding: 20, border: "1px solid #333" }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: palette.accent }}>🎨 Paleta de colores</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {COLOR_PALETTES.map(p => (
                  <div key={p.name} onClick={() => { setIdentity(prev => ({ ...prev, palette_name: p.name, primary_color: p.primary, bg_color: p.bg })); }}
                    style={{ background: p.bg, borderRadius: 12, padding: "14px 12px", cursor: "pointer", border: "3px solid " + (identity.primary_color === p.primary ? "#FFD700" : "transparent"), position: "relative" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      {[p.primary, p.accent, p.text].map((c, i) => <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: "1px solid rgba(255,255,255,.2)" }} />)}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: p.text }}>{p.name}</div>
                    {identity.primary_color === p.primary && <div style={{ position: "absolute", top: 8, right: 8, fontSize: 14 }}>✅</div>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#1a1a1a", borderRadius: 18, padding: 20, border: "1px solid #333" }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: palette.accent }}>🖼 Logo y Banner</div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 8 }}>Logo del restaurante</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <ImageUploadBox value={identity.logo} onChange={v => setIdentity(p => ({ ...p, logo: v }))} size={80} radius={14} />
                  <div style={{ fontSize: 11, color: "#666" }}>Toca para subir</div>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 8 }}>Banner promocional</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <ImageUploadBox value={identity.banner} onChange={v => setIdentity(p => ({ ...p, banner: v }))} size={80} radius={14} />
                  <div style={{ fontSize: 11, color: "#666" }}>Se muestra arriba del menu</div>
                </div>
              </div>
            </div>
            <div style={{ background: "#1a1a1a", borderRadius: 18, padding: 20, border: "1px solid #333" }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: palette.accent }}>📝 Texto</div>
              {[["Nombre del restaurante", "name"], ["Mensaje de bienvenida", "welcome"]].map(([label, key]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>{label}</label>
                  <input value={identity[key] || ""} onChange={e => setIdentity(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #333", fontSize: 14, boxSizing: "border-box", background: "#2a2a2a", color: "#fff" }} />
                </div>
              ))}
            </div>
            <div style={{ background: "#1a1a1a", borderRadius: 18, padding: 20, border: "1px solid #333" }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: palette.accent }}>📱 Redes sociales</div>
              {[["Facebook URL", "facebook"], ["Instagram URL", "instagram"], ["WhatsApp (solo numero)", "whatsapp_link"]].map(([label, key]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>{label}</label>
                  <input value={identity[key] || ""} onChange={e => setIdentity(p => ({ ...p, [key]: e.target.value }))} placeholder={key === "whatsapp_link" ? "8091234567" : "https://..."}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #333", fontSize: 14, boxSizing: "border-box", background: "#2a2a2a", color: "#fff" }} />
                </div>
              ))}
            </div>
            <button onClick={() => onSaveIdentity(identity)} style={{ width: "100%", padding: 16, background: palette.primary, border: "none", borderRadius: 14, color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer" }}>
              Guardar todos los cambios
            </button>
          </div>
        )}
      </div>
      {editing !== null && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.8)" }} onClick={() => setEditing(null)} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#111", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", overflowY: "auto", maxHeight: "92vh", border: "1px solid " + palette.primary + "44" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 900, color: palette.accent }}>{editing === "new" ? "Nuevo plato" : "Editar plato"}</h2>
              <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#fff" }}>✕</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 10, color: "#aaa" }}>Foto del plato</label>
              <ImageUploadBox value={form.image} onChange={v => setForm(p => ({ ...p, image: v }))} size={88} radius={14} />
            </div>
            {[["Nombre", "name", "text"], ["Descripcion", "description", "text"], ["Precio (RD$)", "price", "number"]].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6, color: "#aaa" }}>{label}</label>
                <input type={type} value={form[key] || ""} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #333", fontSize: 14, boxSizing: "border-box", background: "#2a2a2a", color: "#fff" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6, color: "#aaa" }}>Categoria</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #333", fontSize: 14, background: "#2a2a2a", color: "#fff" }}>
                {["Bebidas", "Entradas", "Tacos", "Mexico", "Especialidades", "Postres"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {[["🔥 Picante", "spicy"], ["✅ Disponible", "available"]].map(([label, key]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: "1px solid #333" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#ddd" }}>{label}</span>
                <Toggle on={form[key]} onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))} primary={palette.primary} />
              </div>
            ))}
            <button onClick={saveItem} disabled={saving} style={{ width: "100%", marginTop: 20, padding: 16, background: palette.primary, color: "#fff", border: "none", borderRadius: 14, fontWeight: 900, fontSize: 16, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PinGate({ onUnlock, palette }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const check = () => { if (pin === ADMIN_PIN) { onUnlock(); } else { setError(true); setPin(""); setTimeout(() => setError(false), 1500); } };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 500, display: "flex", alignItems: "flex-end" }}>
      <div style={{ width: "100%", background: "#111", borderRadius: "24px 24px 0 0", padding: "32px 24px 48px", border: "1px solid " + palette.primary + "44" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💀</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: palette.accent }}>Acceso Admin</div>
        </div>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && check()} placeholder="PIN"
          style={{ width: "100%", padding: "14px 18px", borderRadius: 14, border: "2px solid " + (error ? "#ef4444" : palette.primary), fontSize: 20, textAlign: "center", letterSpacing: 8, boxSizing: "border-box", background: "#2a2a2a", color: "#fff", marginBottom: 12 }} />
        {error && <p style={{ textAlign: "center", color: "#ef4444", fontSize: 13, margin: "0 0 10px" }}>PIN incorrecto</p>}
        <button onClick={check} style={{ width: "100%", padding: 15, background: palette.primary, border: "none", borderRadius: 14, color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer" }}>Entrar</button>
      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [identity, setIdentity] = useState({ name: "Maria Taqueria", welcome: "Sabor mexicano en Republica Dominicana", primary_color: DEFAULT_PALETTE.primary, bg_color: DEFAULT_PALETTE.bg, logo: "", banner: "", facebook: "", instagram: "", whatsapp_link: "" });
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [spiceFilter, setSpiceFilter] = useState("todos");

  const palette = COLOR_PALETTES.find(p => p.primary === identity.primary_color) || DEFAULT_PALETTE;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: itemsData }, { data: ordersData }, { data: identityData }] = await Promise.all([
        supabase.from("items").select("*").order("id"),
        supabase.from("orders").select("*").order("id"),
        supabase.from("identity").select("*").limit(1),
      ]);
      if (itemsData && itemsData.length > 0) setItems(itemsData);
      else { const { data: s } = await supabase.from("items").insert(INITIAL_ITEMS).select(); if (s) setItems(s); }
      if (ordersData) setOrders(ordersData);
      if (identityData && identityData.length > 0) setIdentity(identityData[0]);
      else { const { data: s } = await supabase.from("identity").insert([{ name: "Maria Taqueria", welcome: "Sabor mexicano en Republica Dominicana", primary_color: DEFAULT_PALETTE.primary, bg_color: DEFAULT_PALETTE.bg, logo: "", banner: "", facebook: "", instagram: "", whatsapp_link: "" }]).select(); if (s) setIdentity(s[0]); }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const channel = supabase.channel('identity-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'identity' }, () => { loadData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => { loadData(); })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loadData]);

  const handleSaveItem = async (editingId, data) => {
    const { id, created_at, ...rest } = data;
    if (editingId === "new") {
      const { data: n, error } = await supabase.from("items").insert([rest]).select();
      if (error) { alert("Error: " + error.message); return; }
      if (n) setItems(p => [...p, n[0]]);
    } else {
      const { error } = await supabase.from("items").update(rest).eq("id", editingId);
      if (error) { alert("Error: " + error.message); return; }
      setItems(p => p.map(i => i.id === editingId ? { ...i, ...rest } : i));
    }
  };

  const handleDeleteItem = async (id) => { await supabase.from("items").delete().eq("id", id); setItems(p => p.filter(i => i.id !== id)); };

  const handleSaveIdentity = async (data) => {
    const { id, updated_at, ...rest } = data;
    if (id) {
      const { error } = await supabase.from("identity").update(rest).eq("id", id);
      if (!error) { setIdentity(data); alert("Cambios guardados!"); }
      else { alert("Error: " + error.message); }
    } else {
      const { data: n } = await supabase.from("identity").insert([rest]).select();
      if (n) { setIdentity(n[0]); alert("Cambios guardados!"); }
    }
  };

  const addToCart = (item) => setCart(p => { const ex = p.find(i => i.id === item.id); return ex ? p.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) : [...p, { ...item, qty: 1 }]; });
  const removeFromCart = (id) => setCart(p => { const ex = p.find(i => i.id === id); return ex.qty === 1 ? p.filter(i => i.id !== id) : p.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i); });

  const sendWhatsApp = async () => {
    const lines = cart.map(i => "- " + i.name + " x" + i.qty + " = RD$" + (i.price * i.qty)).join("\n");
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const newOrder = { total, items: cart.map(i => ({ ...i })), timestamp: Date.now() };
    const { data: saved } = await supabase.from("orders").insert([newOrder]).select();
    if (saved) setOrders(p => [...p, saved[0]]);
    const wa = identity.whatsapp_link || "8098011531";
    const msg = encodeURIComponent("Hola Maria Taqueria! Quiero hacer este pedido:\n\n" + lines + "\n\nTotal: RD$" + total);
    window.open("https://wa.me/1" + wa + "?text=" + msg, "_blank");
    setCart([]); setShowCart(false);
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const filteredItems = spiceFilter === "todos" ? items : items.filter(i => spiceFilter === "picantes" ? i.spicy : !i.spicy);

  if (showAdmin) return <AdminPanel items={items} setItems={setItems} orders={orders} identity={identity} setIdentity={setIdentity} onClose={() => setShowAdmin(false)} onSaveItem={handleSaveItem} onDeleteItem={handleDeleteItem} onSaveIdentity={handleSaveIdentity} palette={palette} />;

  return (
    <div style={{ minHeight: "100vh", background: palette.bg, fontFamily: "Georgia, serif", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: palette.primary, padding: "14px 16px", color: "#fff", position: "sticky", top: 0, zIndex: 30, boxShadow: "0 4px 20px " + palette.primary + "66" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={() => { const now = Date.now(); if (!window._t) window._t = []; window._t = window._t.filter(t => now - t < 2000); window._t.push(now); if (window._t.length >= 5) { window._t = []; setShowPin(true); } }}>
            {identity.logo ? <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", border: "2px solid rgba(255,255,255,.4)" }}><img src={identity.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div> : <span style={{ fontSize: 32 }}>🌮</span>}
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.3px" }}>{identity.name || "Maria Taqueria"}</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>{identity.welcome || "Sabor mexicano en Republica Dominicana"}</div>
            </div>
          </div>
          <button onClick={() => setShowCart(true)} style={{ background: cartCount > 0 ? palette.accent : "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: 12, padding: "8px 14px", cursor: "pointer", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 6, transition: "background .2s" }}>
            🛒 {cartCount > 0 && <span style={{ background: "#fff", color: palette.primary, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Banner */}
      {identity.banner && (
        <div style={{ width: "100%", height: 180, overflow: "hidden" }}>
          <img src={identity.banner} alt="banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      {/* Spice filter */}
      <div style={{ display: "flex", gap: 8, padding: "12px 16px 8px", overflowX: "auto", scrollbarWidth: "none" }}>
        {[["todos", "🍽 Todos"], ["picantes", "🔥 Picantes"], ["no-picantes", "🌿 No picantes"]].map(([val, label]) => (
          <button key={val} onClick={() => setSpiceFilter(val)} style={{ padding: "7px 16px", borderRadius: 20, border: "2px solid " + (spiceFilter === val ? palette.primary : palette.primary + "44"), background: spiceFilter === val ? palette.primary : "transparent", color: spiceFilter === val ? "#fff" : palette.text, fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Menu by category */}
      <div style={{ paddingBottom: 100 }}>
        {loading ? <Spinner primary={palette.primary} /> :
          CATEGORIES.map(cat => <CategorySection key={cat} category={cat} items={filteredItems} onAdd={addToCart} palette={palette} />)
        }
      </div>

      {/* Footer redes sociales */}
      {(identity.facebook || identity.instagram || identity.whatsapp_link) && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 480, margin: "0 auto", background: palette.bg, borderTop: "1px solid " + palette.primary + "44", padding: "12px 20px", display: "flex", justifyContent: "center", gap: 24, zIndex: 20 }}>
          {identity.facebook && <a href={identity.facebook} target="_blank" rel="noreferrer" style={{ fontSize: 28, textDecoration: "none" }}>📘</a>}
          {identity.whatsapp_link && <a href={"https://wa.me/1" + identity.whatsapp_link} target="_blank" rel="noreferrer" style={{ fontSize: 28, textDecoration: "none" }}>💬</a>}
          {identity.instagram && <a href={identity.instagram} target="_blank" rel="noreferrer" style={{ fontSize: 28, textDecoration: "none" }}>📸</a>}
        </div>
      )}

      {showCart && <CartDrawer cart={cart} onClose={() => setShowCart(false)} onSend={sendWhatsApp} onRemove={removeFromCart} onAdd={addToCart} palette={palette} />}
      {showPin && <PinGate onUnlock={() => { setShowPin(false); setShowAdmin(true); }} palette={palette} />}
    </div>
  );
}