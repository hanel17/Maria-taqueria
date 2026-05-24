import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

const DEFAULT_PRIMARY = "#3F7D3A";
const DEFAULT_BG = "#FFF8EC";
const WHATSAPP = "8098011531";
const ADMIN_PIN = "1234";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f5ede0'/%3E%3Ctext x='40' y='46' font-size='28' text-anchor='middle' fill='%23c8b89a'%3E🌮%3C/text%3E%3C/svg%3E";

const INITIAL_ITEMS = [
  { id: 1, name: "Agua de Jamaica", desc: "Refrescante agua fresca de flor de jamaica, servida bien fría.", price: 95, category: "Bebidas", spicy: false, available: true, image: "" },
  { id: 2, name: "Agua de Horchata", desc: "Tradicional agua de arroz con canela, dulce y cremosa.", price: 95, category: "Bebidas", spicy: false, available: true, image: "" },
  { id: 3, name: "Cerveza Corona", desc: "Cerveza mexicana bien fría, perfecta para acompañar tus tacos.", price: 175, category: "Bebidas", spicy: false, available: true, image: "" },
  { id: 4, name: "Guacamole", desc: "Aguacate fresco con tomate, cebolla, cilantro y limón.", price: 150, category: "Entradas", spicy: false, available: true, image: "" },
  { id: 5, name: "Elotes Asados", desc: "Maíz a la parrilla con mantequilla, queso cotija y chile.", price: 120, category: "Entradas", spicy: true, available: true, image: "" },
  { id: 6, name: "Nachos con Queso", desc: "Totopos crujientes bañados en queso derretido y jalapeños.", price: 160, category: "Entradas", spicy: true, available: true, image: "" },
  { id: 7, name: "Taco de Carne Asada", desc: "Res a la parrilla con guacamole, cebolla y cilantro.", price: 195, category: "Tacos", spicy: false, available: true, image: "" },
  { id: 8, name: "Taco de Pollo", desc: "Pollo desmenuzado con salsa verde, queso fresco y crema.", price: 170, category: "Tacos", spicy: false, available: true, image: "" },
  { id: 9, name: "Taco de Chorizo", desc: "Chorizo mexicano artesanal con papa, queso y salsa roja.", price: 185, category: "Tacos", spicy: true, available: true, image: "" },
  { id: 10, name: "Taco de Camarón", desc: "Camarones salteados con chipotle, repollo y pico de gallo.", price: 210, category: "Tacos", spicy: true, available: true, image: "" },
  { id: 11, name: "Churros con Chocolate", desc: "Churros crujientes con azúcar y canela, chocolate caliente.", price: 130, category: "Postres", spicy: false, available: true, image: "" },
  { id: 12, name: "Flan Casero", desc: "Flan artesanal de vainilla con caramelo, receta de la abuela.", price: 110, category: "Postres", spicy: false, available: true, image: "" },
];

const CATEGORIES = ["Todos", "Bebidas", "Entradas", "Tacos", "México", "Especialidades", "Postres"];

function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

function fmtDate(ts) {
  return new Date(ts).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" });
}

function SpicyBadge() {
  return (
    <span style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 20, padding: "3px 9px", display: "inline-flex", alignItems: "center", gap: 3 }}>
      🔥 Picante
    </span>
  );
}

function Toggle({ on, onClick }) {
  return (
    <div onClick={onClick} style={{ width: 44, height: 24, borderRadius: 12, background: on ? DEFAULT_PRIMARY : "#ccc", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: on ? 22 : 2, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
    </div>
  );
}

function ImageUploadBox({ value, onChange, size = 80, radius = 14 }) {
  const ref = useRef();
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: "#f5ede0", overflow: "hidden", flexShrink: 0, cursor: "pointer", border: "2px dashed #d0c4b0", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={() => ref.current.click()}>
      {value ? <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: size * 0.35, opacity: 0.5 }}>📷</span>}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={async e => { if (e.target.files[0]) onChange(await readFileAsDataURL(e.target.files[0])); }} />
    </div>
  );
}

function ItemCard({ item, onAdd }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 14px rgba(0,0,0,.07)", display: "flex", opacity: item.available ? 1 : 0.4 }}>
      <div style={{ width: 100, height: 100, flexShrink: 0, background: "#f5ede0", overflow: "hidden" }}>
        <img src={item.image || PLACEHOLDER} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1, padding: "12px 14px 12px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 3 }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: "#1a1a1a", lineHeight: 1.3 }}>{item.name}</span>
            {item.spicy && <SpicyBadge />}
          </div>
          <p style={{ fontSize: 11, color: "#888", margin: 0, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.desc}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ color: DEFAULT_PRIMARY, fontWeight: 900, fontSize: 16 }}>RD${item.price}</span>
          {item.available && (
            <button onClick={() => onAdd(item)} style={{ width: 32, height: 32, borderRadius: "50%", background: DEFAULT_PRIMARY, border: "none", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 300 }}>+</button>
          )}
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, onClose, onSend, onRemove, onAdd }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", backdropFilter: "blur(2px)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: DEFAULT_BG, borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Tu pedido 🛒</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" }}>✕</button>
        </div>
        {cart.length === 0
          ? <p style={{ textAlign: "center", color: "#bbb", padding: "32px 0" }}>Tu carrito está vacío</p>
          : <>
            {cart.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f0e8d8" }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                  <img src={item.image || PLACEHOLDER} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                  <div style={{ color: DEFAULT_PRIMARY, fontWeight: 600, fontSize: 12 }}>RD${item.price} c/u</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => onRemove(item.id)} style={{ width: 28, height: 28, borderRadius: "50%", background: "#fee2e2", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: 900, fontSize: 16 }}>−</button>
                  <span style={{ fontWeight: 800, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => onAdd(item)} style={{ width: 28, height: 28, borderRadius: "50%", background: "#dcfce7", border: "none", color: DEFAULT_PRIMARY, cursor: "pointer", fontWeight: 900, fontSize: 16 }}>+</button>
                </div>
                <span style={{ fontWeight: 800, color: "#333", minWidth: 60, textAlign: "right", fontSize: 13 }}>RD${item.price * item.qty}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 20px", fontWeight: 900, fontSize: 18 }}>
              <span>Total</span>
              <span style={{ color: DEFAULT_PRIMARY }}>RD${total}</span>
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

function AdminPanel({ items, setItems, orders, identity, setIdentity, onClose }) {
  const [tab, setTab] = useState("platos");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const openEdit = (item) => { setEditing(item.id); setForm({ ...item }); };
  const openNew = () => { setEditing("new"); setForm({ name: "", desc: "", price: "", category: "Tacos", spicy: false, available: true, image: "" }); };
  const saveItem = () => {
    if (editing === "new") setItems(p => [...p, { ...form, id: Date.now(), price: Number(form.price) }]);
    else setItems(p => p.map(i => i.id === editing ? { ...form, price: Number(form.price) } : i));
    setEditing(null);
  };

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const itemCounts = {};
  orders.forEach(o => o.items.forEach(i => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty; }));
  const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const exportExcel = () => {
    const rows = [];
    orders.forEach(o => {
      o.items.forEach(item => {
        rows.push({
          "Fecha": fmtDate(o.timestamp),
          "# Orden": o.id,
          "Plato": item.name,
          "Categoría": item.category,
          "Cantidad": item.qty,
          "Precio Unit.": item.price,
          "Subtotal": item.price * item.qty,
          "Total Orden": o.total,
          "Picante": item.spicy ? "Sí" : "No",
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [16, 10, 22, 12, 10, 12, 12, 12, 8].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Órdenes");
    const ws2 = XLSX.utils.json_to_sheet(topItems.map(([name, qty]) => ({ "Plato": name, "Total Vendido": qty })));
    XLSX.utils.book_append_sheet(wb, ws2, "Resumen");
    XLSX.writeFile(wb, `ordenes_maria_taqueria_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const tabs = [{ id: "platos", label: "🍽 Platos" }, { id: "ordenes", label: "📊 Órdenes" }, { id: "identidad", label: "🎨 Identidad" }];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", fontFamily: "'Georgia', serif" }}>
      <div style={{ background: "#1a1a1a", padding: "18px 20px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 11, color: "#aaa", letterSpacing: 1.5, marginBottom: 2 }}>PANEL ADMIN</div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Maria Taquería</div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,.12)", border: "none", color: "#fff", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Ver menú →</button>
      </div>
      <div style={{ display: "flex", borderBottom: "2px solid #e8dfd0", background: "#fff", padding: "0 16px" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "14px 16px", border: "none", background: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", color: tab === t.id ? DEFAULT_PRIMARY : "#888", borderBottom: tab === t.id ? `3px solid ${DEFAULT_PRIMARY}` : "3px solid transparent", marginBottom: -2 }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ padding: "20px 16px 80px" }}>
        {tab === "platos" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: "#888", fontSize: 13 }}>{items.length} platos</span>
              <button onClick={openNew} style={{ background: DEFAULT_PRIMARY, color: "#fff", border: "none", borderRadius: 12, padding: "10px 18px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>+ Nuevo plato</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map(item => (
                <div key={item.id} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 6px rgba(0,0,0,.05)" }}>
                  <div style={{ width: 54, height: 54, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f5ede0" }}>
                    <img src={item.image || PLACEHOLDER} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                      <span style={{ fontSize: 11, background: "#f0ece4", borderRadius: 8, padding: "2px 8px" }}>{item.category}</span>
                      {item.spicy && <span style={{ fontSize: 11 }}>🔥</span>}
                    </div>
                    <div style={{ color: DEFAULT_PRIMARY, fontWeight: 800, fontSize: 13, marginTop: 2 }}>RD${item.price}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Toggle on={item.available} onClick={() => setItems(p => p.map(i => i.id === item.id ? { ...i, available: !i.available } : i))} />
                    <button onClick={() => openEdit(item)} style={{ background: "#f0f0f0", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14 }}>✏️</button>
                    <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} style={{ background: "#fee2e2", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === "ordenes" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[["Total órdenes", orders.length, "📋"], ["Ingresos totales", `RD$${totalRevenue.toLocaleString()}`, "💰"]].map(([label, val, icon]) => (
                <div key={label} style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 1px 8px rgba(0,0,0,.06)" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: DEFAULT_PRIMARY }}>{val}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
            {topItems.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>🏆 Más pedidos</div>
                {topItems.map(([name, qty], i) => (
                  <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < topItems.length - 1 ? "1px solid #f5f0e8" : "none" }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>#{i + 1} {name}</span>
                    <span style={{ fontWeight: 800, color: DEFAULT_PRIMARY, fontSize: 13 }}>{qty} uds.</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={exportExcel} style={{ width: "100%", padding: 15, background: "#1a7a3c", border: "none", borderRadius: 14, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
              📥 Exportar a Excel (.xlsx)
            </button>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#555" }}>Historial ({orders.length})</div>
            {orders.length === 0
              ? <p style={{ textAlign: "center", color: "#bbb", padding: "32px 0" }}>Aún no hay órdenes</p>
              : [...orders].reverse().map(order => (
                <div key={order.id} style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>Orden #{order.id}</span>
                    <span style={{ fontSize: 11, color: "#aaa" }}>{fmtDate(order.timestamp)}</span>
                  </div>
                  {order.items.map(i => (
                    <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", padding: "3px 0" }}>
                      <span>{i.name} × {i.qty}</span><span>RD${i.price * i.qty}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid #f5f0e8", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 13 }}>
                    <span>Total</span><span style={{ color: DEFAULT_PRIMARY }}>RD${order.total}</span>
                  </div>
                </div>
              ))
            }
          </>
        )}
        {tab === "identidad" && (
          <div style={{ background: "#fff", borderRadius: 18, padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 10 }}>Logo del restaurante</label>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ImageUploadBox value={identity.logo} onChange={v => setIdentity(p => ({ ...p, logo: v }))} size={90} radius={18} />
                <div style={{ fontSize: 12, color: "#999", lineHeight: 1.6 }}>Toca la imagen<br />para subir un logo.</div>
              </div>
            </div>
            {[["Nombre del restaurante", "name"], ["Mensaje de bienvenida", "welcome"]].map(([label, key]) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>{label}</label>
                <input value={identity[key]} onChange={e => setIdentity(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e0d8cc", fontSize: 14, boxSizing: "border-box", background: DEFAULT_BG, fontFamily: "Georgia, serif" }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 14 }}>
              {[["Color principal", "primary"], ["Color de fondo", "bg"]].map(([label, key]) => (
                <div key={key} style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>{label}</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: identity[key] || DEFAULT_PRIMARY, flexShrink: 0, border: "2px solid #e0d8cc" }} />
                    <input value={identity[key] || ""} onChange={e => setIdentity(p => ({ ...p, [key]: e.target.value }))}
                      style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: "1.5px solid #e0d8cc", fontSize: 12, background: DEFAULT_BG }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {editing !== null && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)" }} onClick={() => setEditing(null)} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: DEFAULT_BG, borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", overflowY: "auto", maxHeight: "92vh" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 900 }}>{editing === "new" ? "Nuevo plato" : "Editar plato"}</h2>
              <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 10 }}>Foto del plato</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <ImageUploadBox value={form.image} onChange={v => setForm(p => ({ ...p, image: v }))} size={88} radius={14} />
                <div style={{ fontSize: 12, color: "#999", lineHeight: 1.7 }}>Toca para subir<br />una foto.</div>
              </div>
            </div>
            {[["Nombre", "name", "text"], ["Descripción", "desc", "text"], ["Precio (RD$)", "price", "number"]].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>{label}</label>
                <input type={type} value={form[key] || ""} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e0d8cc", fontSize: 14, boxSizing: "border-box", background: "#fff", fontFamily: "Georgia, serif" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>Categoría</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e0d8cc", fontSize: 14, background: "#fff", fontFamily: "Georgia, serif" }}>
                {["Bebidas", "Entradas", "Tacos", "México", "Especialidades", "Postres"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {[["🔥 Picante", "spicy"], ["✅ Disponible", "available"]].map(([label, key]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: "1px solid #f0e8d8" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
                <Toggle on={form[key]} onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))} />
              </div>
            ))}
            <button onClick={saveItem} style={{ width: "100%", marginTop: 20, padding: 16, background: DEFAULT_PRIMARY, color: "#fff", border: "none", borderRadius: 14, fontWeight: 900, fontSize: 16, cursor: "pointer" }}>
              Guardar cambios
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const check = () => { if (pin === ADMIN_PIN) { onUnlock(); } else { setError(true); setPin(""); setTimeout(() => setError(false), 1500); } };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 500, display: "flex", alignItems: "flex-end" }}>
      <div style={{ width: "100%", background: DEFAULT_BG, borderRadius: "24px 24px 0 0", padding: "32px 24px 48px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Acceso Admin</div>
          <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>Ingresa el PIN de administrador</div>
        </div>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && check()} placeholder="PIN"
          style={{ width: "100%", padding: "14px 18px", borderRadius: 14, border: `2px solid ${error ? "#ef4444" : "#e0d8cc"}`, fontSize: 20, textAlign: "center", letterSpacing: 8, boxSizing: "border-box", background: "#fff", marginBottom: 12, fontFamily: "Georgia, serif" }} />
        {error && <p style={{ textAlign: "center", color: "#ef4444", fontSize: 13, margin: "0 0 10px" }}>PIN incorrecto</p>}
        <button onClick={check} style={{ width: "100%", padding: 15, background: DEFAULT_PRIMARY, border: "none", borderRadius: 14, color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer" }}>Entrar</button>
        <p style={{ textAlign: "center", fontSize: 11, color: "#ccc", marginTop: 12 }}>PIN predeterminado: 1234</p>
      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useLocalStorage("mt_items", INITIAL_ITEMS);
  const [orders, setOrders] = useLocalStorage("mt_orders", []);
  const [identity, setIdentity] = useLocalStorage("mt_identity", { name: "Maria Taquería", welcome: "Sabor mexicano en República Dominicana", primary: DEFAULT_PRIMARY, bg: DEFAULT_BG, logo: "" });
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [spiceFilter, setSpiceFilter] = useState("todos");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const primary = identity.primary || DEFAULT_PRIMARY;
  const bgColor = identity.bg || DEFAULT_BG;

  const addToCart = (item) => setCart(p => { const ex = p.find(i => i.id === item.id); return ex ? p.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) : [...p, { ...item, qty: 1 }]; });
  const removeFromCart = (id) => setCart(p => { const ex = p.find(i => i.id === id); return ex.qty === 1 ? p.filter(i => i.id !== id) : p.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i); });

  const sendWhatsApp = () => {
    const lines = cart.map(i => `• ${i.name} x${i.qty} = RD$${i.price * i.qty}`).join("\n");
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const newOrder = { id: orders.length + 1, timestamp: Date.now(), items: cart.map(i => ({ ...i })), total };
    setOrders(p => [...p, newOrder]);
    const msg = encodeURIComponent(`¡Hola Maria Taquería! 🌮\nQuiero hacer este pedido:\n\n${lines}\n\n*Total: RD$${total}*`);
    window.open(`https://wa.me/1${WHATSAPP}?text=${msg}`, "_blank");
    setCart([]);
    setShowCart(false);
  };

  const filtered = items.filter(item => {
    const cat = activeCategory === "Todos" || item.category === activeCategory;
    const sp = spiceFilter === "todos" || (spiceFilter === "picantes" ? item.spicy : !item.spicy);
    return cat && sp && item.available;
  });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  if (showAdmin) return <AdminPanel items={items} setItems={setItems} orders={orders} identity={identity} setIdentity={setIdentity} onClose={() => setShowAdmin(false)} />;

  return (
    <div style={{ minHeight: "100vh", background: bgColor, fontFamily: "'Georgia', serif", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: primary, padding: "16px 20px 18px", color: "#fff", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{identity.name || "Maria Taquería"}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>{identity.welcome || "Sabor mexicano en República Dominicana"}</div>
            </div>
          </div>
<div onClick={() => {
  const now = Date.now();
  if (!window._tapTimes) window._tapTimes = [];
  window._tapTimes = window._tapTimes.filter(t => now - t < 2000);
  window._tapTimes.push(now);
  if (window._tapTimes.length >= 5) {
    window._tapTimes = [];
    setShowPin(true);
  }
}} style={{ cursor: "pointer", userSelect: "none" }}>
  {identity.logo
    ? <div style={{ width: 42, height: 42, borderRadius: 10, overflow: "hidden", border: "2px solid rgba(255,255,255,.3)" }}><img src={identity.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
    : <span style={{ fontSize: 30 }}>🌮</span>
  }
</div>        </div>
      </div>
      <div style={{ overflowX: "auto", display: "flex", gap: 8, padding: "14px 16px 4px", scrollbarWidth: "none" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "8px 18px", borderRadius: 20, border: `1.5px solid ${activeCategory === cat ? primary : "#ddd"}`, background: activeCategory === cat ? primary : "#fff", color: activeCategory === cat ? "#fff" : "#666", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
            {cat}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, padding: "10px 16px 14px" }}>
        {[["todos", "Todos"], ["picantes", "🔥 Picantes"], ["no-picantes", "🌿 No picantes"]].map(([val, label]) => (
          <button key={val} onClick={() => setSpiceFilter(val)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${spiceFilter === val ? "#1a1a1a" : "#ddd"}`, background: spiceFilter === val ? "#1a1a1a" : "#fff", color: spiceFilter === val ? "#fff" : "#666", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 16px 130px" }}>
        {filtered.length === 0
          ? <p style={{ textAlign: "center", color: "#bbb", padding: "48px 0" }}>No hay platos disponibles aquí</p>
          : filtered.map(item => <ItemCard key={item.id} item={item} onAdd={addToCart} />)
        }
      </div>
      {cartCount > 0 && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
          <button onClick={() => setShowCart(true)} style={{ background: primary, color: "#fff", border: "none", borderRadius: 30, padding: "15px 26px", fontWeight: 900, fontSize: 15, cursor: "pointer", boxShadow: `0 8px 28px ${primary}66`, display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
            <span style={{ background: "rgba(255,255,255,.25)", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{cartCount}</span>
            Ver pedido · RD${cart.reduce((s, i) => s + i.price * i.qty, 0)}
          </button>
        </div>
      )}
      {showCart && <CartDrawer cart={cart} onClose={() => setShowCart(false)} onSend={sendWhatsApp} onRemove={removeFromCart} onAdd={addToCart} />}
      {showPin && <PinGate onUnlock={() => { setShowPin(false); setShowAdmin(true); }} />}
    </div>
  );
}