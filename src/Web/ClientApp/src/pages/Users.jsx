import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";

const TAB_CONFIG = [
    { key: "All", label: "Tat ca nguoi dung" },
    { key: "PendingApproval", label: "Dang cho phe duyet" },
    { key: "Banned", label: "Bi cam" },
];

export const UserList = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState("All");
    const [search, setSearch] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [data, setData] = useState({ items: [], totalCount: 0, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const adminId = 1;

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const result = await userService.getUsers({
                tab,
                search,
                pageNumber,
                pageSize: 10,
            });
            setData(result);
        } catch (err) {
            setError(err?.response?.data?.title || err?.message || "Load users failed.");
        } finally {
            setLoading(false);
        }
    }, [tab, search, pageNumber]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const onSearch = () => {
        setPageNumber(1);
    };

    const onApprove = async (id) => {
        try {
            await userService.approveUser(id, adminId);
            await loadUsers();
        } catch (err) {
            setError(err?.response?.data?.title || err?.message || "Approve failed.");
        }
    };

    const onBan = async (id) => {
        const reason = window.prompt("Nhap ly do chan nguoi dung:");
        if (!reason) return;

        try {
            await userService.banUser(id, reason, adminId);
            await loadUsers();
        } catch (err) {
            setError(err?.response?.data?.title || err?.message || "Ban failed.");
        }
    };

    const onUnban = async (id) => {
        try {
            await userService.unbanUser(id, adminId);
            await loadUsers();
        } catch (err) {
            setError(err?.response?.data?.title || err?.message || "Unban failed.");
        }
    };

    return (
        <div>
            <h2>Quan ly nguoi dung</h2>

            <div className="d-flex gap-2 mb-3">
                {TAB_CONFIG.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`btn ${tab === item.key ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => {
                            setTab(item.key);
                            setPageNumber(1);
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="row g-2 mb-3">
                <div className="col-md-6">
                    <input
                        className="form-control"
                        placeholder="Tim theo username/email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="col-md-2">
                    <button type="button" className="btn btn-primary w-100" onClick={onSearch}>
                        Tim kiem
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <p>Dang tai danh sach nguoi dung...</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Ten</th>
                                <th>Email</th>
                                <th>Trang thai</th>
                                <th>Phe duyet</th>
                                <th>Thao tac nhanh</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items?.length ? data.items.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-link p-0"
                                            onClick={() => navigate(`/users/${u.id}`)}
                                        >
                                            {u.username || "(No username)"}
                                        </button>
                                    </td>
                                    <td>{u.email || "-"}</td>
                                    <td>{u.status}</td>
                                    <td>{u.approvalStatus}</td>
                                    <td className="d-flex gap-2">
                                        {u.approvalStatus !== "Approved" && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-success"
                                                onClick={() => onApprove(u.id)}
                                            >
                                                Phe duyet
                                            </button>
                                        )}
                                        {u.status === "Banned" ? (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-warning"
                                                onClick={() => onUnban(u.id)}
                                            >
                                                Mo khoa
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger"
                                                onClick={() => onBan(u.id)}
                                            >
                                                Chan
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted">Khong co du lieu.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Tong: {data.totalCount || 0}</span>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        disabled={pageNumber <= 1}
                        onClick={() => setPageNumber((p) => p - 1)}
                    >
                        Truoc
                    </button>
                    <span className="small align-self-center">
                        Trang {pageNumber}/{data.totalPages || 1}
                    </span>
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        disabled={pageNumber >= (data.totalPages || 1)}
                        onClick={() => setPageNumber((p) => p + 1)}
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
};
