package com.ht.DAO.base;

import java.lang.reflect.Field;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.hibernate.Query;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.persister.entity.AbstractEntityPersister;
import org.springframework.orm.hibernate3.SessionFactoryUtils;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

public abstract class AbstractSuperDAO extends HibernateDaoSupport {

	protected Connection getConnection() throws Exception {
		try {
			return SessionFactoryUtils.getDataSource(getSessionFactory())
					.getConnection();
		} catch (SQLException e) {
			throw new Exception(e);
		}
	}

	protected <E> AbstractEntityPersister getEntityPersister(List<E> list) {
		return (AbstractEntityPersister) this.getSessionFactory()
				.getClassMetadata(list.get(0).getClass());
	}

	public static void clearConn(Connection connection, ResultSet rs,
			Statement cs) {

		if (rs != null) {
			try {
				rs.close();
			} catch (SQLException e) {
			}
		}

		if (cs != null) {
			try {
				cs.close();
			} catch (SQLException e) {
			}
		}

		if (connection != null) {
			try {
				connection.close();
			} catch (SQLException e) {
			}
		}

	}

	protected boolean current_RS_Had_Nothing(CallableStatement callStmt,
			boolean isRS) throws SQLException {

		if (isRS == false && endRS(callStmt)) {
			return true;
		}

		return false;
	}

	protected boolean endRS(CallableStatement callStmt) throws SQLException {
		return callStmt.getUpdateCount() == -1;
	}

	protected Connection getConnection(Connection connForceUse)
			throws SQLException {

		if (connForceUse != null) {
			return connForceUse;
		}

		return SessionFactoryUtils.getDataSource(getSessionFactory())
				.getConnection();
	}

	protected void buildOutput(ClassEntity[] entities, SQLQuery q) {

		for (ClassEntity o : entities) {

			if (StringUtils.isEmpty(o.entityName)) {
				q.addEntity(o.entityClass);
				continue;
			}

			q.addEntity(o.entityName, o.entityClass);
		}
	}

	protected void buildParams(Object[] objects, Query q) {
		int i = 0;

		if (objects != null) {
			for (Object o : objects) {

				if (o instanceof Date) {
					q.setDate(i++, (Date) o);
				}

				if (o instanceof Integer) {
					q.setInteger(i++, (Integer) o);
				}

				if (o instanceof Long) {
					q.setLong(i++, (Long) o);
				}

				if (o instanceof String) {
					q.setString(i++, (String) o);
				}

			}
		}
	}

	protected ResultSet getFollowingRS(CallableStatement callStmt, String sql)
			throws SQLException {

		boolean isResultSet = callStmt.execute();
		if (isResultSet) {
			return callStmt.getResultSet();
		}

		while (true) {

			boolean isRS = callStmt.getMoreResults();

			if (isRS) {
				return callStmt.getResultSet();
			}

			if (current_RS_Had_Nothing(callStmt, isRS)) {
				break;
			}
		}

		return null;

	}

	protected <E> List<Field> getTobePersistedFields(E element) {

		List<Field> fieldsList = new ArrayList<Field>();

		for (Class<?> clazz = element.getClass(); clazz != Object.class; clazz = clazz
				.getSuperclass()) {
			try {
				fieldsList.addAll(Arrays.asList(clazz.getDeclaredFields()));
			} catch (Exception e) {

			}
		}
		return fieldsList;
	}

	protected void fillinDataByRS(ResultSet rs, List<HTResultSet> l)
			throws SQLException {

		while (rs.next()) {
			HTResultSet m = new HTResultSet();
			int numOfCols = rs.getMetaData().getColumnCount();
			for (int i = 1; i <= numOfCols; i++) {

				m.put(rs.getMetaData().getColumnName(i),
						rs.getObject(rs.getMetaData().getColumnName(i)));

			}

			l.add(m);
		}
	}

	

	public void delete(final Object obj) {

		this.getHibernateTemplate().delete(obj);

	}

	public Object save(final Object obj) {

		Object o = this.getHibernateTemplate().save(obj);
		return o;

	}

	public void update(final Object obj) {

		this.getHibernateTemplate().update(obj);

	}

	public void saveOrUpdate(final Object obj) {
		try {
			this.getHibernateTemplate().saveOrUpdate(obj);
		} catch (final RuntimeException re) {
			this.logger.error("SaveOrUpdate failed: "
					+ obj.getClass().getSimpleName(), re);
			throw re;
		}
	}

	public Session getHSession() {
		return this.getSessionFactory().openSession();
	}

}
