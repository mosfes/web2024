// ---------------- work6.js ----------------

// Import React-Bootstrap
const RB = ReactBootstrap;
const { Alert, Card, Button, Table } = ReactBootstrap;

// ตารางแสดงข้อมูล (ตกแต่งด้วย table-striped, table-hover, table-bordered)
function StudentTable({ data, app }) {
  return (
    <Table striped bordered hover>
      <thead className="table-primary">
        <tr>
          <th>รหัส (ID)</th>
          <th>คำนำหน้า</th>
          <th>ชื่อ</th>
          <th>สกุล</th>
          <th>Email</th>
          <th>แก้ไข</th>
          <th>ลบ</th>
        </tr>
      </thead>
      <tbody>
        {data.map((s, index) => (
          <tr key={index}>
            <td>{s.id}</td>
            <td>{s.title}</td>
            <td>{s.fname}</td>
            <td>{s.lname}</td>
            <td>{s.email}</td>
            <td>
              <Button
                variant="warning"
                size="sm"
                onClick={() => app.edit(s)}
              >
                แก้ไข
              </Button>
            </td>
            <td>
              <Button
                variant="danger"
                size="sm"
                onClick={() => app.delete(s)}
              >
                ลบ
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

// Input ที่มี label
function TextInput({ label, app, value, style }) {
  return (
    <div className="mb-2">
      <label className="form-label fw-semibold">
        {label}:
        <input
          className="form-control"
          style={style}
          value={app.state[value]}
          onChange={(ev) => {
            const s = {};
            s[value] = ev.target.value;
            app.setState(s);
          }}
        />
      </label>
    </div>
  );
}

// กล่องล็อกอิน/ล็อกเอาท์ แสดงรูป user
function LoginBox({ user, app }) {
  if (user) {
    return (
      <div className="d-flex align-items-center mb-3">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt="User Avatar"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              marginRight: "10px",
            }}
          />
        )}
        <div>
          <p className="m-0">
            ยินดีต้อนรับ, <strong>{user.displayName || user.email}</strong>
          </p>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => app.google_logout()}
          >
            Logout
          </Button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="mb-3">
        <Button
          variant="primary"
          onClick={() => app.google_login()}
        >
          Login with Google
        </Button>
      </div>
    );
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      students: [],
      // ฟิลด์ต่างๆ
      stdid: "",
      stdtitle: "",
      stdfname: "",
      stdlname: "",
      stdemail: "",
      stdphone: "",
      user: null,
    };

    // เมื่อ Auth เปลี่ยนสถานะ (ล็อกอิน/ล็อกเอาต์)
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user: user });
      } else {
        this.setState({ user: null });
      }
    });
  }

  // ส่วนหัว Card
  title = (
    <Alert variant="info" className="m-0">
      <b>Work6 :</b> Firebase
    </Alert>
  );

  // ส่วนท้าย Card
  footer = (
    <div>
      By นายณัฐภัทร ประชุมวงษ์ 663380002-9 <br />
      College of Computing, Khon Kaen University
    </div>
  );

  // ดึงข้อมูลจาก Firestore (อ่านครั้งเดียว)
  readData() {
    db.collection("students").get().then((querySnapshot) => {
      const stdlist = [];
      querySnapshot.forEach((doc) => {
        stdlist.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ students: stdlist });
    });
  }

  // อ่านข้อมูลแบบ realtime (Auto Read)
  autoRead() {
    db.collection("students").onSnapshot((querySnapshot) => {
      const stdlist = [];
      querySnapshot.forEach((doc) => {
        stdlist.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ students: stdlist });
    });
  }

  // กดแก้ไข -> ดึงข้อมูลจาก row มา setState เพื่อแสดงในฟอร์ม
  edit(std) {
    this.setState({
      stdid: std.id,
      stdtitle: std.title,
      stdfname: std.fname,
      stdlname: std.lname,
      stdemail: std.email,
      stdphone: std.phone,
    });
  }

  // กดลบ
  delete(std) {
    if (window.confirm("ต้องการลบข้อมูลนี้หรือไม่?")) {
      db.collection("students")
        .doc(std.id)
        .delete()
        .then(() => {
          alert("ลบข้อมูลสำเร็จ");
          this.readData();
        })
        .catch((error) => {
          alert("เกิดข้อผิดพลาด: " + error.message);
        });
    }
  }

  // เพิ่มหรือแก้ไข (ใช้ doc(id).set(..., { merge: true }))
  // - ถ้า doc นั้นยังไม่มีอยู่ จะถูกสร้างขึ้นใหม่
  // - ถ้ามีอยู่แล้ว จะเป็นการอัปเดตตามฟิลด์ที่ระบุ
  insertData() {
    if (!this.state.stdid) {
      alert("กรุณากรอก ID ก่อน");
      return;
    }
    db.collection("students")
      .doc(this.state.stdid)
      .set(
        {
          title: this.state.stdtitle,
          fname: this.state.stdfname,
          lname: this.state.stdlname,
          email: this.state.stdemail,
          phone: this.state.stdphone,
        },
        { merge: true }
      )
      .then(() => {
        alert("เพิ่มหรือแก้ไขข้อมูลสำเร็จ (ID: " + this.state.stdid + ")");
        // เคลียร์ค่าใน state
        this.setState({
          stdid: "",
          stdtitle: "",
          stdfname: "",
          stdlname: "",
          stdemail: "",
          stdphone: "",
        });
        this.readData(); // โหลดข้อมูลใหม่
      })
      .catch((error) => {
        alert("เกิดข้อผิดพลาด: " + error.message);
      });
  }

  // ล็อกอินด้วย Google
  google_login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    firebase.auth().signInWithPopup(provider);
  }

  // ล็อกเอาท์
  google_logout() {
    if (window.confirm("Are you sure?")) {
      firebase.auth().signOut();
    }
  }

  render() {
    return (
      <Card className="shadow">
        <Card.Header className="bg-white">{this.title}</Card.Header>
        <Card.Body>
          {/* แสดงกล่องล็อกอิน/ล็อกเอาท์ + รูปผู้ใช้ */}
          <LoginBox user={this.state.user} app={this} />

          {/* ถ้าล็อกอินแล้ว จึงให้แสดงปุ่มและตารางข้อมูล */}
          {this.state.user ? (
            <div>
              <div className="mb-3">
                <Button
                  variant="success"
                  className="me-2"
                  onClick={() => this.readData()}
                >
                  Read Data
                </Button>
                <Button
                  variant="info"
                  onClick={() => this.autoRead()}
                >
                  Auto Read
                </Button>
              </div>

              <StudentTable data={this.state.students} app={this} />
            </div>
          ) : (
            <div className="text-danger">
              โปรดล็อคอินก่อน จึงจะสามารถดูข้อมูลได้
            </div>
          )}
        </Card.Body>

        {/* ฟอร์มเพิ่ม/แก้ไขข้อมูลนักศึกษา (จะซ่อนถ้าไม่ล็อกอิน) */}
        {this.state.user && (
          <Card.Footer>
            <h6 className="fw-bold">เพิ่ม/แก้ไขข้อมูล (ตั้ง ID เอง)</h6>
            <div className="row g-2">
              <div className="col-auto">
                <TextInput label="ID" app={this} value="stdid" style={{ width: 120 }} />
              </div>
              <div className="col-auto">
                <TextInput label="คำนำหน้า" app={this} value="stdtitle" style={{ width: 100 }} />
              </div>
              <div className="col-auto">
                <TextInput label="ชื่อ" app={this} value="stdfname" style={{ width: 120 }} />
              </div>
              <div className="col-auto">
                <TextInput label="สกุล" app={this} value="stdlname" style={{ width: 120 }} />
              </div>
              <div className="col-auto">
                <TextInput label="Email" app={this} value="stdemail" style={{ width: 150 }} />
              </div>
              <div className="col-auto">
                <TextInput label="Phone" app={this} value="stdphone" style={{ width: 120 }} />
              </div>
              <div className="col-auto d-flex align-items-end">
                <Button
                  variant="primary"
                  onClick={() => this.insertData()}
                >
                  Save / Update
                </Button>
              </div>
            </div>
          </Card.Footer>
        )}

        <Card.Footer className="text-center">{this.footer}</Card.Footer>
      </Card>
    );
  }
}

// ---------------- Firebase Config ----------------
const firebaseConfig = {
  apiKey: "AIzaSyBmV24zv9rwx822FiIlnNJFkKVq8U7vDeY",
  authDomain: "web2567-nattapat.firebaseapp.com",
  projectId: "web2567-nattapat",
  storageBucket: "web2567-nattapat.firebasestorage.app",
  messagingSenderId: "542087746610",
  appId: "1:542087746610:web:8f55f74f83a058fd5d982b",
  measurementId: "G-BJQJRRSCBH",
};
firebase.initializeApp(firebaseConfig);

// ประกาศตัวแปร db สำหรับ Firestore
const db = firebase.firestore();

// เรนเดอร์ Component หลัก
const container = document.getElementById("myapp");
const root = ReactDOM.createRoot(container);
root.render(<App />);
