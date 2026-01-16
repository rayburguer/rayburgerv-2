# RAYBURGER V3 - MASTER PLAN (PROJECT BIBLE)

## 1. VISIÓN DEL PROYECTO
Web App Progresiva (PWA) de comida rápida para Venezuela.
- *Modelo:* Mobile-First, sin pasarela de pago automática (validación manual).
- *Core:* Fidelización agresiva (Cashback + Referidos "Matrimonio").
- *Prioridad:* Honestidad del sistema, cero deuda técnica, velocidad de carga.

## 2. STACK TECNOLÓGICO (ESTRICTO)
- *Frontend:* Next.js (App Router), Tailwind CSS.
- *Backend/DB:* Supabase (PostgreSQL, Auth, Edge Functions).
- *IA/Logic:* Google AI Studio / Gemini Models.
- *Estado:* Zustand (Manejo de carrito y sesión).

## 3. REGLAS DE NEGOCIO (INVIOLABLES)
1. *Single Source of Truth:* El saldo del usuario es la suma de wallet_ledger. Nunca se confía en el Frontend.
2. *Validación Manual:*
   - Pedido creado -> Estado: PENDING_REVIEW.
   - Admin verifica pago bancario -> Cambia a: PAID.
   - SOLO al cambiar a PAID se ejecutan los Triggers de Cashback.
3. *Anti-Fraude Admin:* Los usuarios con rol admin NO generan cashback ni comisiones.
4. *Matrimonio de Referidos:* Un usuario B pertenece al usuario A para siempre. Si A es baneado, B deja de generar comisiones, pero sigue operando.
5. *Registro:* Login principal vía WhatsApp (Phone Auth). Datos: Cumpleaños obligatorio.

## 4. ESTRUCTURA DE DATOS (RESUMEN)
Ver archivo schema.sql para detalles técnicos.
- *Roles:* Admin, Customer, Guest.
- *Tablas Críticas:* profiles, orders, wallet_ledger, referrals.
- *Seguridad:* RLS (Row Level Security) activo en todas las tablas.

## 5. UI/UX GUIDELINES
- *Estética:* Oscura, moderna, fotos de comida de alta calidad ("Food Porn").
- *Feedback:* Barras de progreso para premios. Confeti/Animación al ganar puntos.
- *Velocidad:* Carga instantánea. Si falla internet, mostrar mensaje amigable.
- *Admin:* Panel simplificado para uso en móvil (Confirmar pagos con 1 dedo).

## 6. FASES DE DESARROLLO
1. *Database:* Implementar Schema en Supabase. (LISTO)
2. *Conexión:* Configurar variables de entorno y cliente Supabase.
3. *Auth:* Login con Teléfono.
4. *Core Loop:* Menú -> Carrito -> Crear Pedido.
5. *Admin Loop:* Ver Pedido -> Aprobar -> Trigger de Puntos.
6. *Loyalty UI:* Mostrar saldo y raspadito en el perfil del usuario.


## 7. NOTAS TÉCNICAS DEL ARQUITECTO (IMPLEMENTACIÓN)

### A. Registro de Usuarios (Auth)
Cuando se use supabase.auth.signUp(), es OBLIGATORIO pasar los metadatos del referido para que el Trigger de "Matrimonio" funcione en la base de datos.
```javascript
const { data, error } = await supabase.auth.signUp({
  phone: '+58...', // Usar Phone Auth
  password: '...',
  options: {
    data: {
      full_name: 'Juan Pérez',
      birth_date: '1990-01-01',
      referrer_id: 'uuid-del-amigo-que-recomendo' // NULL si no hay
    }
  }
})

B. Consultar Saldo (Single Source of Truth)
PROHIBIDO buscar saldo en una columna simple. Siempre usar la función RPC blindada:

const { data: balance, error } = await supabase.rpc('get_user_balance', { target_user_id: user.id })

C. Flujo de Pago Seguro
Cliente: Crea orden -> Status pending_payment.
Cliente: Sube foto/referencia -> Update payment_proof_url.
Admin: Verifica banco real -> Cambia status a paid.
Backend (Automático): El Trigger process_order_payment se dispara solo, asigna cashback y paga al referidor.
<!-- end list -->